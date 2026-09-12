import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getSupabase, getSupabaseAuthClient, getSupabaseAdmin, supabaseStorageError } from './supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  createdAt: string;
  sessionVersion: number;
  emailVerifiedAt?: string;
};

type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
  lastSeenAt: string;
  expires: number;
};

type SessionPayload = {
  id: string;
  email: string;
  expires: number;
  sessionId: string;
  version: number;
};

type ActionType = 'email-verification' | 'password-reset';

const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.CF_PAGES);

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && isHosted) throw new Error('AUTH_SECRET must be configured in production.');
  return secret || 'local-development-secret-hum-medicals-supabase';
}

export function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizedUser(user: User): User {
  return { ...user, sessionVersion: user.sessionVersion || 1 };
}

function parseSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  )
    return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionPayload;
    return typeof value.id === 'string' &&
      typeof value.email === 'string' &&
      typeof value.sessionId === 'string' &&
      typeof value.version === 'number' &&
      value.expires > Date.now()
      ? value
      : null;
  } catch {
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = normalizedEmail(email);
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data, error } = await supabase.from('users').select('*').eq('email', normalized).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return normalizedUser({
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    salt: data.salt,
    sessionVersion: data.session_version,
    emailVerifiedAt: data.email_verified_at || undefined,
    createdAt: data.created_at,
  });
}

async function findUserById(id: string): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (data) {
    return normalizedUser({
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      salt: data.salt,
      sessionVersion: data.session_version,
      emailVerifiedAt: data.email_verified_at || undefined,
      createdAt: data.created_at,
    });
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: authData } = await admin.auth.admin.getUserById(id);
    if (authData?.user) {
      const u = authData.user;
      const name = u.user_metadata?.name || u.email?.split('@')[0] || 'Author';
      const email = u.email?.toLowerCase().trim() || '';
      return normalizedUser({
        id: u.id,
        name,
        email,
        passwordHash: 'managed_by_supabase_auth',
        salt: 'supabase_auth',
        sessionVersion: 1,
        createdAt: u.created_at || new Date().toISOString(),
        emailVerifiedAt: u.email_confirmed_at || undefined,
      });
    }
  }
  return null;
}

async function saveUser(user: User): Promise<User> {
  const next = normalizedUser(user);
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: next.id,
        name: next.name,
        email: next.email,
        password_hash: next.passwordHash || 'managed_by_supabase_auth',
        salt: next.salt || 'supabase_auth',
        session_version: next.sessionVersion,
        email_verified_at: next.emailVerifiedAt || null,
      },
      { onConflict: 'id' }
    );
  if (error) throw new Error(error.message);
  return next;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: User; requiresConfirmation: boolean; activationLink?: string }> {
  const normalized = normalizedEmail(email);
  const authClient = getSupabaseAuthClient();
  const db = getSupabase();
  const adminClient = getSupabaseAdmin();

  if (!authClient) throw supabaseStorageError();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const emailRedirectTo = `${siteUrl}/auth/callback`;

  // Check if user already exists in Supabase Auth
  if (adminClient) {
    try {
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email?.toLowerCase() === normalized);
      if (existing) {
        if (existing.email_confirmed_at) {
          throw new Error('An account with this email already exists and is confirmed. Please sign in or reset your password.');
        }

        // Account was created previously but unconfirmed!
        // Generate an activation link so the user is never stuck
        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: 'magiclink',
          email: normalized,
          options: { redirectTo: emailRedirectTo },
        });

        // Attempt sending email via resend if not blocked
        try {
          await authClient.auth.resend({ type: 'signup', email: normalized, options: { emailRedirectTo } });
        } catch {
          // email rate limit may occur, ignore
        }

        const existingUser: User = {
          id: existing.id,
          name: name.trim() || existing.user_metadata?.name || 'Author',
          email: normalized,
          createdAt: existing.created_at || new Date().toISOString(),
          sessionVersion: 1,
        };

        if (db) {
          await db.from('users').upsert(
            {
              id: existing.id,
              name: existingUser.name,
              email: normalized,
              password_hash: 'managed_by_supabase_auth',
              salt: 'supabase_auth',
              session_version: 1,
              created_at: existingUser.createdAt,
            },
            { onConflict: 'id' }
          );
        }

        return {
          user: existingUser,
          requiresConfirmation: true,
          activationLink: linkData?.properties?.action_link || undefined,
        };
      }
    } catch (listErr: unknown) {
      if (listErr instanceof Error && listErr.message.includes('already exists and is confirmed')) {
        throw listErr;
      }
      console.warn('[Auth] listUsers check warning:', listErr);
    }
  }

  // 1. Attempt signup with Supabase Auth (anon client triggers email confirmations)
  const { data, error } = await authClient.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { name: name.trim() },
      emailRedirectTo,
    },
  });

  if (error) {
    // If over email send rate limit on Supabase default pool:
    if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
      if (adminClient) {
        console.warn('[Auth] Supabase email rate limit reached on default pool. Creating user via admin client.');
        const { data: adminData, error: adminErr } = await adminClient.auth.admin.createUser({
          email: normalized,
          password,
          user_metadata: { name: name.trim() },
          email_confirm: false,
        });

        if (adminErr && !adminErr.message.toLowerCase().includes('already registered')) {
          throw new Error(adminErr.message);
        }

        // Generate immediate direct activation link
        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: 'signup',
          email: normalized,
          password,
          options: { redirectTo: emailRedirectTo },
        });

        const authUser = adminData?.user;
        const userId = authUser?.id || (await adminClient.auth.admin.listUsers()).data.users.find((u) => u.email?.toLowerCase() === normalized)?.id;

        if (userId) {
          const newUser: User = {
            id: userId,
            name: name.trim(),
            email: normalized,
            createdAt: new Date().toISOString(),
            sessionVersion: 1,
          };
          if (db) {
            await db.from('users').upsert(
              {
                id: userId,
                name: name.trim(),
                email: normalized,
                password_hash: 'managed_by_supabase_auth',
                salt: 'supabase_auth',
                session_version: 1,
                created_at: newUser.createdAt,
              },
              { onConflict: 'id' }
            );
          }
          return {
            user: newUser,
            requiresConfirmation: true,
            activationLink: linkData?.properties?.action_link || undefined,
          };
        }
      }
      throw new Error(
        'Supabase email sending rate limit reached (free tier allows limited emails/hour on default mail pool). Please wait a few minutes or configure custom SMTP in Supabase.'
      );
    }

    if (error.message.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
      throw new Error('An account with this email already exists in Supabase. Please sign in or use forgot password.');
    }

    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Unable to create author account in Supabase.');
  }

  const authUser = data.user;
  const isConfirmed = Boolean(authUser.email_confirmed_at || data.session);
  const requiresConfirmation = !isConfirmed;

  // Generate activation link as instant fallback if confirmation required
  let activationLink: string | undefined = undefined;
  if (requiresConfirmation && adminClient) {
    try {
      const { data: linkData } = await adminClient.auth.admin.generateLink({
        type: 'signup',
        email: normalized,
        password,
        options: { redirectTo: emailRedirectTo },
      });
      activationLink = linkData?.properties?.action_link || undefined;
    } catch {
      // ignore
    }
  }

  const newUser: User = {
    id: authUser.id,
    name: name.trim(),
    email: normalized,
    createdAt: authUser.created_at || new Date().toISOString(),
    sessionVersion: 1,
    emailVerifiedAt: authUser.email_confirmed_at || undefined,
  };

  // Sync into public.users
  if (db) {
    await db.from('users').upsert(
      {
        id: authUser.id,
        name: name.trim(),
        email: normalized,
        password_hash: 'managed_by_supabase_auth',
        salt: 'supabase_auth',
        session_version: 1,
        email_verified_at: authUser.email_confirmed_at || null,
        created_at: newUser.createdAt,
      },
      { onConflict: 'id' }
    );
  }

  return { user: newUser, requiresConfirmation, activationLink };
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const normalized = normalizedEmail(email);
  const authClient = getSupabaseAuthClient();
  const db = getSupabase();

  if (!authClient) throw supabaseStorageError();

  const { data, error } = await authClient.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('email not confirmed')) {
      throw new Error(
        'Your email address has not been confirmed yet. Please check your inbox and spam folder for the verification link sent by Supabase, and click the link to activate your account.'
      );
    }
    return null;
  }

  if (!data.user) return null;

  const authUser = data.user;
  const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Author';

  const user: User = {
    id: authUser.id,
    name,
    email: normalized,
    sessionVersion: 1,
    createdAt: authUser.created_at || new Date().toISOString(),
    emailVerifiedAt: authUser.email_confirmed_at || undefined,
  };

  // Sync into public.users
  if (db) {
    await db.from('users').upsert(
      {
        id: authUser.id,
        name,
        email: normalized,
        password_hash: 'managed_by_supabase_auth',
        salt: 'supabase_auth',
        session_version: 1,
        email_verified_at: authUser.email_confirmed_at || new Date().toISOString(),
        created_at: user.createdAt,
      },
      { onConflict: 'id' }
    );
  }

  return user;
}

async function storeSession(record: SessionRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase.from('sessions').insert({
    id: record.id,
    user_id: record.userId,
    created_at: record.createdAt,
    last_seen_at: record.lastSeenAt,
    expires_at: new Date(record.expires).toISOString(),
  });
  if (error) {
    console.warn('[Auth] Note: Could not write session record to Supabase:', error.message);
  }
}

async function getSession(id: string): Promise<SessionRecord | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    lastSeenAt: data.last_seen_at,
    expires: new Date(data.expires_at).getTime(),
  };
}

async function removeSession(id: string, userId?: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('sessions').delete().eq('id', id);
  }
}

async function removeAllSessions(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('sessions').delete().eq('user_id', userId);
  }
}

export async function createSession(user: User): Promise<string> {
  const id = crypto.randomUUID();
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  await storeSession({
    id,
    userId: user.id,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    expires,
  });
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    expires,
    sessionId: id,
    version: normalizedUser(user).sessionVersion,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url')}`;
}

export async function setSession(user: User, forceSecure?: boolean): Promise<string> {
  const isProd = process.env.NODE_ENV === 'production';
  const isLocalhost = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost'));
  const secure = forceSecure !== undefined ? forceSecure : (isProd && !isLocalhost);
  const sessionToken = await createSession(user);
  cookies().set('hum_medicals_session', sessionToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return sessionToken;
}

export async function clearSession(forceSecure?: boolean): Promise<void> {
  const session = parseSession(cookies().get('hum_medicals_session')?.value);
  if (session) await removeSession(session.sessionId, session.id);
  const isProd = process.env.NODE_ENV === 'production';
  const isLocalhost = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost'));
  const secure = forceSecure !== undefined ? forceSecure : (isProd && !isLocalhost);
  cookies().set('hum_medicals_session', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function currentUser(): Promise<User | null> {
  const session = parseSession(cookies().get('hum_medicals_session')?.value);
  if (!session) return null;
  const [user, record] = await Promise.all([findUserById(session.id), getSession(session.sessionId)]);
  if (!user || user.email !== session.email || user.sessionVersion !== session.version) {
    return null;
  }
  if (record) {
    return record.userId === user.id && record.expires > Date.now() ? user : null;
  }
  // If session record lookup was omitted or delayed, valid cryptographic token is honoured
  return session.expires > Date.now() ? user : null;
}

export async function currentSession(): Promise<SessionRecord | null> {
  const session = parseSession(cookies().get('hum_medicals_session')?.value);
  if (!session) return null;
  const record = await getSession(session.sessionId);
  return record?.userId === session.id && record.expires > Date.now() ? record : null;
}

export async function listSessionsForUser(userId: string): Promise<SessionRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('last_seen_at', { ascending: false })
    .limit(50);
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expires: new Date(row.expires_at).getTime(),
  }));
}

export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  const sessions = await listSessionsForUser(userId);
  await Promise.all(sessions.filter((item) => item.id !== currentSessionId).map((item) => removeSession(item.id, userId)));
}

export async function revokeSessionForUser(userId: string, sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session || session.userId !== userId) throw new Error('Session not found.');
  await removeSession(sessionId, userId);
}

export async function setEmailVerified(userId: string): Promise<User> {
  const user = await findUserById(userId);
  if (!user) throw new Error('Account not found.');
  return saveUser({ ...user, emailVerifiedAt: new Date().toISOString() });
}

export async function resetPasswordForUser(userId: string, password: string): Promise<User> {
  const user = await findUserById(userId);
  if (!user) throw new Error('Account not found.');

  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.auth.admin.updateUserById(userId, { password });
  }

  const updated = await saveUser({
    ...user,
    sessionVersion: (user.sessionVersion || 1) + 1,
  });
  await removeAllSessions(userId);
  return updated;
}

export async function deleteAccount(userId: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user) throw new Error('Account not found.');
  await removeAllSessions(userId);

  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  }

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function createAuthAction(userId: string, type: ActionType): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + 1000 * 60 * (type === 'password-reset' ? 30 : 60 * 24);
  const key = crypto.createHash('sha256').update(token).digest('hex');

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase.from('auth_actions').insert({
    id: key,
    user_id: userId,
    type,
    expires_at: new Date(expires).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}

export async function consumeAuthAction(token: string, type: ActionType): Promise<string | null> {
  const key = crypto.createHash('sha256').update(token).digest('hex');
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data } = await supabase.from('auth_actions').select('*').eq('id', key).maybeSingle();
  if (!data) return null;
  await supabase.from('auth_actions').delete().eq('id', key);
  const expires = new Date(data.expires_at).getTime();
  return data.type === type && expires > Date.now() ? data.user_id : null;
}

export const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  emailVerifiedAt: user.emailVerifiedAt,
});
