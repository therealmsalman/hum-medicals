import { NextResponse } from 'next/server';
import { getSupabaseAuthClient, getSupabaseAdmin, supabaseStorageError } from '@/lib/supabase';
import { normalizedEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 });
    }

    const normalized = normalizedEmail(email);
    const authClient = getSupabaseAuthClient();
    const adminClient = getSupabaseAdmin();

    if (!authClient) throw supabaseStorageError();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const emailRedirectTo = `${siteUrl}/auth/callback`;

    // 1. Check if user exists and their confirmation status via admin client
    let isAlreadyConfirmed = false;

    if (adminClient) {
      try {
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email?.toLowerCase() === normalized);
        if (existing && existing.email_confirmed_at) {
          isAlreadyConfirmed = true;
        }
      } catch (listErr) {
        console.warn('[Auth] Unable to check user list in admin client:', listErr);
      }
    }

    if (isAlreadyConfirmed) {
      return NextResponse.json({
        alreadyConfirmed: true,
        message: 'Your account email is already confirmed! You can sign in immediately.',
      });
    }

    // 2. Try sending the confirmation email via Supabase Auth
    const { error: resendError } = await authClient.auth.resend({
      type: 'signup',
      email: normalized,
      options: {
        emailRedirectTo,
      },
    });

    if (!resendError) {
      return NextResponse.json({
        ok: true,
        rateLimited: false,
        message: `A fresh confirmation email has been dispatched to ${normalized}. Please check your inbox and spam folder.`,
      });
    }

    console.warn('[Auth] Supabase resend returned:', resendError);

    // 3. If Supabase email pool is rate-limited (status 429 / over_email_send_rate_limit)
    if (resendError.status === 429 || resendError.code === 'over_email_send_rate_limit' || adminClient) {
      if (adminClient) {
        const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
          type: 'magiclink',
          email: normalized,
          options: {
            redirectTo: emailRedirectTo,
          },
        });

        if (!linkErr && linkData?.properties?.action_link) {
          return NextResponse.json({
            ok: true,
            rateLimited: true,
            activationLink: linkData.properties.action_link,
            message:
              "Supabase's shared email service is currently rate-limited (free pool limit of 3-4 emails/hour). You can activate your account immediately using the link below:",
          });
        }
      }
    }

    return NextResponse.json(
      {
        message:
          resendError.message ||
          'Unable to resend confirmation email at this time. Supabase rate limit may be active.',
      },
      { status: 429 }
    );
  } catch (error) {
    console.error('[Auth] Resend confirmation error:', error);
    const message = error instanceof Error ? error.message : 'Unable to resend confirmation.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
