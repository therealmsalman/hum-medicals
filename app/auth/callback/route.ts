import { NextResponse } from 'next/server';
import { getSupabaseAuthClient, getSupabase } from '@/lib/supabase';
import { setSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account';
  const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';

  if (code) {
    const authClient = getSupabaseAuthClient();
    if (authClient) {
      const { data, error } = await authClient.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        const authUser = data.user;
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Author';
        const email = authUser.email?.toLowerCase().trim() || '';

        // Sync into public.users
        const db = getSupabase();
        if (db) {
          await db.from('users').upsert(
            {
              id: authUser.id,
              name,
              email,
              password_hash: 'managed_by_supabase_auth',
              salt: 'supabase_auth',
              session_version: 1,
              email_verified_at: new Date().toISOString(),
              created_at: authUser.created_at || new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        }

        const userObj = {
          id: authUser.id,
          name,
          email,
          passwordHash: 'managed_by_supabase_auth',
          salt: 'supabase_auth',
          createdAt: authUser.created_at || new Date().toISOString(),
          sessionVersion: 1,
          emailVerifiedAt: new Date().toISOString(),
        };

        const sessionToken = await setSession(userObj, isSecure);
        const destination = next.startsWith('/') ? next : '/account';
        const response = NextResponse.redirect(new URL(destination, request.url));
        response.cookies.set('hum_medicals_session', sessionToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    }
  }

  // If already confirmed or token invalid, redirect to sign-in with notification
  return NextResponse.redirect(new URL('/sign-in?confirmed=true', request.url));
}
