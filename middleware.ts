import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.AUTH_SECRET || 'local-development-secret-hum-medicals-supabase';

function base64UrlToText(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    if (bytesToBase64Url(new Uint8Array(digest)) !== signature) return false;
    const session = JSON.parse(base64UrlToText(payload));
    return (
      typeof session.id === 'string' &&
      typeof session.email === 'string' &&
      typeof session.expires === 'number' &&
      session.expires > Date.now()
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedApi = pathname.startsWith('/api/admin');
  const isProtectedPage = pathname.startsWith('/account') || pathname.startsWith('/admin');

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get('hum_medicals_session')?.value;
  const valid = await hasValidSession(token);

  if (!valid) {
    if (isProtectedApi) {
      return NextResponse.json({ message: 'Sign in or create an account to use Hum Medicals.' }, { status: 401 });
    }
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', `${pathname}${search}`);
    const response = NextResponse.redirect(signInUrl);
    if (token) {
      response.cookies.delete('hum_medicals_session');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/api/admin/:path*'],
};

