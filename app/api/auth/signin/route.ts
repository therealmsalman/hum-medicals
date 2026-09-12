import { NextResponse } from 'next/server';
import { authenticate, publicUser, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await authenticate(email, password);
    if (!user) {
      return NextResponse.json({ message: 'Incorrect email or password.' }, { status: 401 });
    }

    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const token = await setSession(user, isSecure);

    const response = NextResponse.json({ user: publicUser(user) });
    response.cookies.set('hum_medicals_session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to sign in.' },
      { status: 503 }
    );
  }
}
