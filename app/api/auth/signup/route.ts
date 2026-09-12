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

    const user = await createUser(name, email, password);

    // Must be awaited so cookie headers and session records are committed
    await setSession(user);

    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (error) {
    console.error('[Auth] Sign up error:', error);
    const message = error instanceof Error ? error.message : 'Unable to create account.';
    return NextResponse.json({ message }, { status: message.includes('storage is not configured') ? 503 : 400 });
  }
}
