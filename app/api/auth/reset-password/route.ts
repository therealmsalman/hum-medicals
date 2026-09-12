import { NextResponse } from 'next/server';
import { consumeAuthAction, resetPasswordForUser, publicUser, setSession } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rate = await rateLimit(request, 'reset-password', 10, 300);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!token) {
      return NextResponse.json(
        { message: 'Reset token is missing. Please use the link sent to your email.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const userId = await consumeAuthAction(token, 'password-reset');

    if (!userId) {
      return NextResponse.json(
        { message: 'This password reset link is invalid or has expired. Please request a new reset link.' },
        { status: 400 }
      );
    }

    const updatedUser = await resetPasswordForUser(userId, password);

    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const sessionToken = await setSession(updatedUser, isSecure);

    const response = NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. You are now signed in.',
      user: publicUser(updatedUser),
    });
    response.cookies.set('hum_medicals_session', sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to reset password.' },
      { status: 500 }
    );
  }
}
