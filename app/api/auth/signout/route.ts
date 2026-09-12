import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST(request: Request) {
  const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
  await clearSession(isSecure);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('hum_medicals_session', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}

