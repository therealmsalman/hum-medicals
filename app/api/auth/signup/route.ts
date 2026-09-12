import { NextResponse } from 'next/server';
import { createUser, publicUser, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ message: 'Enter your full name.' }, { status: 400 });
    }
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ message: 'Use a password with at least 8 characters.' }, { status: 400 });
    }

    const { user, requiresConfirmation, activationLink } = await createUser(name, email, password);

    if (requiresConfirmation) {
      return NextResponse.json(
        {
          requiresConfirmation: true,
          activationLink,
          message:
            'Account registered! A verification email has been requested. Please check your inbox and spam folder to confirm your email before signing in.',
          user: publicUser(user),
        },
        { status: 201 }
      );
    }

    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const token = await setSession(user, isSecure);

    const response = NextResponse.json({ user: publicUser(user), requiresConfirmation: false }, { status: 201 });
    response.cookies.set('hum_medicals_session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Auth] Sign up error:', error);
    const message = error instanceof Error ? error.message : 'Unable to create account.';
    return NextResponse.json({ message }, { status: message.includes('storage is not configured') ? 503 : 400 });
  }
}
