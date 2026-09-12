import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';

export type User = { id: string; name: string; email: string; passwordHash: string; salt: string; createdAt: string; sessionVersion: number; emailVerifiedAt?: string };
type SessionRecord = { id: string; userId: string; createdAt: string; lastSeenAt: string; expires: number };
type SessionPayload = { id: string; email: string; expires: number; sessionId: string; version: number };
type ActionType = 'email-verification' | 'password-reset';
type ActionRecord = { userId: string; type: ActionType; expires: number };

const usersPath = path.join(process.cwd(), 'data', 'users.json');
const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');
const actionsPath = path.join(process.cwd(), 'data', 'auth-actions.json');
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const emailKey = (email: string) => `hum-medicals:user:email:${email}`;
const idKey = (id: string) => `hum-medicals:user:id:${id}`;
const sessionKey = (id: string) => `hum-medicals:session:${id}`;
const sessionListKey = (userId: string) => `hum-medicals:session-ids:${userId}`;
const actionKey = (token: string) => `hum-medicals:auth-action:${crypto.createHash('sha256').update(token).digest('hex')}`;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && isHosted) throw new Error('AUTH_SECRET must be configured in production.');
  return secret || 'local-development-secret-do-not-use-in-production';
}
function storageError() { return new Error('Account storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.'); }
function readLocal<T>(file: string, fallback: T): T { try { return JSON.parse(fs.readFileSync(file, 'utf8') || '') as T; } catch { return fallback; } }
function writeLocal<T>(file: string, value: T) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2)); }
function hash(password: string, salt: string) { return crypto.scryptSync(password, salt, 64).toString('hex'); }
function normalizedEmail(email: string) { return email.trim().toLowerCase(); }
function normalizedUser(user: User): User { return { ...user, sessionVersion: user.sessionVersion || 1 }; }

function parseSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionPayload;
    return typeof value.id === 'string' && typeof value.email === 'string' && typeof value.sessionId === 'string' && typeof value.version === 'number' && value.expires > Date.now() ? value : null;
  } catch { return null; }
}

export async function findUserByEmail(email: string) {
  const normalized = normalizedEmail(email);
  if (redis) { const user = await redis.get<User>(emailKey(normalized)); return user ? normalizedUser(user) : null; }
  if (isHosted) throw storageError();
  return readLocal<User[]>(usersPath, []).map(normalizedUser).find(user => user.email === normalized) || null;
}
async function findUserById(id: string) {
  if (redis) { const user = await redis.get<User>(idKey(id)); return user ? normalizedUser(user) : null; }
  if (isHosted) throw storageError();
  return readLocal<User[]>(usersPath, []).map(normalizedUser).find(user => user.id === id) || null;
}
async function saveUser(user: User) {
  const next = normalizedUser(user);
  if (redis) { await redis.set(emailKey(next.email), next); await redis.set(idKey(next.id), next); return next; }
  if (isHosted) throw storageError();
  const users = readLocal<User[]>(usersPath, []).map(normalizedUser);
  const index = users.findIndex(item => item.id === next.id);
  if (index < 0) throw new Error('Account not found.');
  users[index] = next; writeLocal(usersPath, users); return next;
}

export async function createUser(name: string, email: string, password: string) {
  const normalized = normalizedEmail(email);
  const salt = crypto.randomBytes(16).toString('hex');
  const user: User = { id: crypto.randomUUID(), name: name.trim(), email: normalized, passwordHash: hash(password, salt), salt, createdAt: new Date().toISOString(), sessionVersion: 1 };
  if (redis) {
    const created = await redis.setnx(emailKey(normalized), user);
    if (!created) throw new Error('An account with this email already exists.');
    await redis.set(idKey(user.id), user); return user;
  }
  if (isHosted) throw storageError();
  const users = readLocal<User[]>(usersPath, []);
  if (users.some(item => item.email === normalized)) throw new Error('An account with this email already exists.');
  users.push(user); writeLocal(usersPath, users); return user;
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const expected = Buffer.from(user.passwordHash, 'hex'); const received = Buffer.from(hash(password, user.salt), 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received) ? user : null;
}

async function storeSession(record: SessionRecord) {
  if (redis) { await redis.set(sessionKey(record.id), record, { px: Math.max(1, record.expires - Date.now()) }); await redis.lpush(sessionListKey(record.userId), record.id); return; }
  if (isHosted) throw storageError();
  const sessions = readLocal<SessionRecord[]>(sessionsPath, []).filter(item => item.expires > Date.now()); sessions.push(record); writeLocal(sessionsPath, sessions);
}
async function getSession(id: string) {
  if (redis) return (await redis.get<SessionRecord>(sessionKey(id))) || null;
  if (isHosted) throw storageError();
  return readLocal<SessionRecord[]>(sessionsPath, []).find(item => item.id === id) || null;
}
async function removeSession(id: string, userId?: string) {
  if (redis) { await redis.del(sessionKey(id)); if (userId) await redis.lrem(sessionListKey(userId), 1, id); return; }
  if (isHosted) throw storageError();
  writeLocal(sessionsPath, readLocal<SessionRecord[]>(sessionsPath, []).filter(item => item.id !== id));
}
async function removeAllSessions(userId: string) {
  const sessions = await listSessionsForUser(userId);
  await Promise.all(sessions.map(session => removeSession(session.id, userId)));
}

export async function createSession(user: User) {
  const id = crypto.randomUUID(); const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  await storeSession({ id, userId: user.id, createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), expires });
  const payload: SessionPayload = { id: user.id, email: user.email, expires, sessionId: id, version: normalizedUser(user).sessionVersion };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url')}`;
}
export async function setSession(user: User) { cookies().set('hum_medicals_session', await createSession(user), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 }); }
export async function clearSession() { const session = parseSession(cookies().get('hum_medicals_session')?.value); if (session) await removeSession(session.sessionId, session.id); cookies().set('hum_medicals_session', '', { httpOnly: true, path: '/', maxAge: 0 }); }

export async function currentUser() {
  const session = parseSession(cookies().get('hum_medicals_session')?.value); if (!session) return null;
  const [user, record] = await Promise.all([findUserById(session.id), getSession(session.sessionId)]);
  return user?.email === session.email && user.sessionVersion === session.version && record?.userId === user.id && record.expires > Date.now() ? user : null;
}
export async function currentSession() {
  const session = parseSession(cookies().get('hum_medicals_session')?.value); if (!session) return null;
  const record = await getSession(session.sessionId); return record?.userId === session.id && record.expires > Date.now() ? record : null;
}
export async function listSessionsForUser(userId: string) {
  if (redis) {
    const ids = await redis.lrange<string>(sessionListKey(userId), 0, 99);
    const items = await Promise.all(ids.map(id => redis.get<SessionRecord>(sessionKey(id))));
    return items.filter((item): item is SessionRecord => item !== null && item.expires > Date.now()).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }
  if (isHosted) throw storageError();
  return readLocal<SessionRecord[]>(sessionsPath, []).filter(item => item.userId === userId && item.expires > Date.now()).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}
export async function revokeOtherSessions(userId: string, currentSessionId: string) { const sessions = await listSessionsForUser(userId); await Promise.all(sessions.filter(item => item.id !== currentSessionId).map(item => removeSession(item.id, userId))); }
export async function revokeSessionForUser(userId: string, sessionId: string) { const session = await getSession(sessionId); if (!session || session.userId !== userId) throw new Error('Session not found.'); await removeSession(sessionId, userId); }

export async function setEmailVerified(userId: string) { const user = await findUserById(userId); if (!user) throw new Error('Account not found.'); return saveUser({ ...user, emailVerifiedAt: new Date().toISOString() }); }
export async function resetPasswordForUser(userId: string, password: string) { const user = await findUserById(userId); if (!user) throw new Error('Account not found.'); const salt = crypto.randomBytes(16).toString('hex'); const updated = await saveUser({ ...user, salt, passwordHash: hash(password, salt), sessionVersion: user.sessionVersion + 1 }); await removeAllSessions(userId); return updated; }
export async function deleteAccount(userId: string) {
  const user = await findUserById(userId); if (!user) throw new Error('Account not found.'); await removeAllSessions(userId);
  if (redis) { await redis.del(emailKey(user.email)); await redis.del(idKey(user.id)); return; }
  if (isHosted) throw storageError();
  writeLocal(usersPath, readLocal<User[]>(usersPath, []).filter(item => item.id !== userId));
}

export async function createAuthAction(userId: string, type: ActionType) {
  const token = crypto.randomBytes(32).toString('base64url'); const expires = Date.now() + 1000 * 60 * (type === 'password-reset' ? 30 : 60 * 24);
  const record: ActionRecord = { userId, type, expires };
  if (redis) { await redis.set(actionKey(token), record, { px: expires - Date.now() }); return token; }
  if (isHosted) throw storageError();
  const actions = readLocal<Record<string, ActionRecord>>(actionsPath, {}); actions[actionKey(token)] = record; writeLocal(actionsPath, actions); return token;
}
export async function consumeAuthAction(token: string, type: ActionType) {
  const key = actionKey(token);
  if (redis) { const record = await redis.get<ActionRecord>(key); await redis.del(key); return record && record.type === type && record.expires > Date.now() ? record.userId : null; }
  if (isHosted) throw storageError();
  const actions = readLocal<Record<string, ActionRecord>>(actionsPath, {}); const record = actions[key]; delete actions[key]; writeLocal(actionsPath, actions); return record && record.type === type && record.expires > Date.now() ? record.userId : null;
}

export const publicUser = (user: User) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, emailVerifiedAt: user.emailVerifiedAt });
