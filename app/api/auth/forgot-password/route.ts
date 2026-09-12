import { NextResponse } from 'next/server';
import { findUserByEmail, createAuthAction } from '@/lib/auth';
import { isEmailDeliveryConfigured, sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rate = await rateLimit(request, 'forgot-password', 5, 300);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    let devResetUrl: string | undefined = undefined;

    if (user) {
      const token = await createAuthAction(user.id, 'password-reset');
      const origin =
        request.headers.get('origin') ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'http://localhost:3000';
      const resetUrl = `${origin.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

      if (isEmailDeliveryConfigured()) {
        try {
          await sendPasswordResetEmail(user.email, resetUrl);
        } catch (emailError) {
          console.error('[Auth] Failed to send password reset email:', emailError);
          // In non-production or if email fails, expose link for dev ease
          if (process.env.NODE_ENV !== 'production') {
            devResetUrl = resetUrl;
          }
        }
      } else {
        console.log(`\n========================================`);
        console.log(`[DEV AUTH] Password reset link for: ${user.email}`);
        console.log(resetUrl);
        console.log(`========================================\n`);
        devResetUrl = resetUrl;
      }
    }

    // Always return a neutral success message to prevent account enumeration
    return NextResponse.json({
      message:
        'If an account is registered with this email, a secure password reset link has been dispatched.',
      devResetUrl,
    });
  } catch (error) {
    console.error('[Auth] Forgot password error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to process password reset request.' },
      { status: 500 }
    );
  }
}
