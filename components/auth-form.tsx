'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  MailCheck,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [activationLink, setActivationLink] = useState<string | null>(null);

  // Resend state
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: 'success' | 'error' | 'rate_limited';
    message: string;
    link?: string;
  } | null>(null);
  const [enteredEmail, setEnteredEmail] = useState('');
  const [isUnconfirmedError, setIsUnconfirmedError] = useState(false);
  const [showDirectResend, setShowDirectResend] = useState(false);
  const [directEmailInput, setDirectEmailInput] = useState('');

  const searchParams = useSearchParams();
  const isConfirmedParam = searchParams.get('confirmed') === 'true';
  const requested = searchParams.get('next');
  const destination = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/account';
  const isSignup = mode === 'signup';
  const alternate = `${isSignup ? '/sign-in' : '/sign-up'}${requested ? `?next=${encodeURIComponent(requested)}` : ''}`;

  async function triggerResend(targetEmail?: string) {
    const emailToUse = (targetEmail || registeredEmail || enteredEmail || directEmailInput).trim();
    if (!emailToUse) {
      setResendStatus({
        type: 'error',
        message: 'Please enter your email address first.',
      });
      return;
    }

    setResending(true);
    setResendStatus(null);

    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });
      const data = await res.json();
      setResending(false);

      if (data.alreadyConfirmed) {
        setResendStatus({
          type: 'success',
          message: 'Your account email is already confirmed! Please sign in below.',
        });
        return;
      }

      if (data.rateLimited && data.activationLink) {
        setActivationLink(data.activationLink);
        setResendStatus({
          type: 'rate_limited',
          message: data.message,
          link: data.activationLink,
        });
        return;
      }

      if (!res.ok) {
        setResendStatus({
          type: 'error',
          message: data.message || 'Unable to resend confirmation email.',
        });
        return;
      }

      setResendStatus({
        type: 'success',
        message: data.message || 'A new confirmation email has been dispatched. Please check your inbox and spam folder.',
      });
    } catch {
      setResending(false);
      setResendStatus({
        type: 'error',
        message: 'A connection error occurred while resending. Please try again.',
      });
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsUnconfirmedError(false);
    setResendStatus(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const submittedEmail = typeof data.email === 'string' ? data.email : '';
    setEnteredEmail(submittedEmail);

    try {
      const response = await fetch(`/api/auth/${isSignup ? 'signup' : 'signin'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setBusy(false);

      if (!response.ok) {
        setMessage(result.message || 'Unable to complete authentication.');
        const msgLower = (result.message || '').toLowerCase();
        if (
          result.unconfirmed ||
          msgLower.includes('not been confirmed') ||
          msgLower.includes('confirm your email') ||
          msgLower.includes('email not confirmed')
        ) {
          setIsUnconfirmedError(true);
        }
        return;
      }

      if (result.requiresConfirmation) {
        setRegisteredEmail(submittedEmail);
        if (result.activationLink) {
          setActivationLink(result.activationLink);
        }
        setConfirmationSent(true);
        return;
      }

      window.dispatchEvent(new Event('hum-medicals:auth-change'));
      window.location.href = destination;
    } catch {
      setBusy(false);
      setMessage('A connection error occurred. Please try again.');
    }
  }

  if (confirmationSent) {
    return (
      <div className="glass-panel mx-auto max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl shadow-teal-500/5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <MailCheck className="h-8 w-8" />
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Account Registered</span>
        </div>

        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Check Your Inbox
        </h2>

        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          A verification link has been sent from Supabase to{' '}
          <strong className="text-teal-600 dark:text-teal-400">{registeredEmail || 'your email'}</strong>.
        </p>

        {/* Instant 1-click Activation Fallback (Shown if email rate limit active or direct activation available) */}
        {activationLink && (
          <div className="mt-5 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-200">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>Direct Activation Available</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-teal-700 dark:text-teal-300">
              If the Supabase verification email is delayed due to free-tier rate limits, you can activate your account immediately:
            </p>
            <a
              href={activationLink}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
            >
              <span>Verify & Activate Account Now</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-teal-500/20 bg-teal-50/50 p-4 text-left text-xs leading-relaxed text-slate-600 dark:bg-teal-950/20 dark:text-slate-300">
          <p className="font-semibold text-teal-800 dark:text-teal-300">Next Steps:</p>
          <ol className="mt-2 list-decimal pl-4 space-y-1.5">
            <li>Open your email inbox (and check your spam/junk folder).</li>
            <li>Click the confirmation link to activate your author account.</li>
            <li>Once confirmed, you will be able to sign in and submit manuscripts.</li>
          </ol>
        </div>

        {/* Resend Status Feedback */}
        {resendStatus && (
          <div
            className={`mt-4 rounded-2xl border p-3.5 text-left text-xs ${
              resendStatus.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : resendStatus.type === 'rate_limited'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-start gap-2">
              {resendStatus.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              )}
              <div className="flex-1 space-y-2">
                <p>{resendStatus.message}</p>
                {resendStatus.link && (
                  <a
                    href={resendStatus.link}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200 underline"
                  >
                    <span>Click here to activate account directly</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resend & Navigation Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => triggerResend(registeredEmail)}
            disabled={resending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin text-teal-600' : ''}`} />
            <span>{resending ? 'Resending email…' : 'Resend Confirmation Email'}</span>
          </button>

          <Link
            href="/sign-in"
            className="premium-button flex w-full items-center justify-center gap-2 !py-3 text-xs font-bold"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel mx-auto max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl shadow-teal-500/5">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Author & Member Access</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isSignup ? 'Create Author Account' : 'Welcome Back'}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {isSignup
            ? 'Set up your free account to submit manuscripts, track peer review, and receive tailored clinical briefs.'
            : 'Sign in to access your submission registry, editorial dashboard, and workspace.'}
        </p>
      </div>

      {isConfirmedParam && (
        <div
          role="status"
          className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>Your email has been successfully confirmed! Please sign in below.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className="mt-7 space-y-4">
        {isSignup && (
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                name="name"
                required
                minLength={2}
                className="premium-input !py-3 !pl-11"
                placeholder="Dr. Muhammad Salman"
                aria-label="Full name"
                disabled={busy}
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="email"
              required
              type="email"
              className="premium-input !py-3 !pl-11"
              placeholder="author@institution.edu"
              aria-label="Email address"
              disabled={busy}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            {!isSignup && (
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="password"
              required
              minLength={8}
              type={showPassword ? 'text' : 'password'}
              className="premium-input !py-3 !pl-11 !pr-11 font-mono"
              placeholder="••••••••"
              aria-label="Password"
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <span className="text-[10px] text-slate-400">At least 8 characters required</span>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="premium-button flex w-full items-center justify-center gap-2 !py-3.5 text-xs font-bold disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <span>{isSignup ? 'Register Author Account' : 'Sign In to Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {message && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 space-y-2">
              <p>{message}</p>
              {isUnconfirmedError && (
                <div className="pt-2 border-t border-red-500/20">
                  <button
                    type="button"
                    onClick={() => triggerResend(enteredEmail)}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Resending…' : 'Resend Confirmation Email'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resend Status Feedback on Form */}
      {resendStatus && (
        <div
          className={`mt-4 rounded-2xl border p-3.5 text-left text-xs ${
            resendStatus.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              : resendStatus.type === 'rate_limited'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-start gap-2">
            {resendStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            )}
            <div className="flex-1 space-y-2">
              <p>{resendStatus.message}</p>
              {resendStatus.link && (
                <a
                  href={resendStatus.link}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200 underline"
                >
                  <span>Click here to activate account directly</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resend Helper Link on Sign-in */}
      {!isSignup && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowDirectResend(!showDirectResend)}
            className="text-[11px] font-medium text-teal-600 hover:underline dark:text-teal-400"
          >
            Didn&apos;t receive verification email? Resend link
          </button>

          {showDirectResend && (
            <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-left dark:border-white/10 dark:bg-white/5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Resend Confirmation To
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="email"
                  value={directEmailInput}
                  onChange={(e) => setDirectEmailInput(e.target.value)}
                  placeholder="author@institution.edu"
                  className="premium-input !py-2 !text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => triggerResend(directEmailInput)}
                  disabled={resending || !directEmailInput}
                  className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 transition"
                >
                  {resending ? 'Sending…' : 'Resend'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternate Link */}
      <div className="mt-8 border-t border-slate-200/70 pt-5 text-center text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
        <span>{isSignup ? 'Already have an author account?' : 'New to Hum Medicals?'} </span>
        <Link
          className="font-bold text-teal-600 hover:underline dark:text-teal-400"
          href={alternate}
        >
          {isSignup ? 'Sign in here' : 'Create free account'}
        </Link>
      </div>

      {/* Trust reassurance */}
      <p className="mt-4 text-center text-[11px] text-slate-400">
        Free open-access platform • Strictly zero publishing fees
      </p>
    </div>
  );
}
