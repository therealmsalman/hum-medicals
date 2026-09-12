'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);
    setDevResetUrl(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setMessage(data.message || 'Password reset link dispatched.');
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
      } else {
        setIsError(true);
        setMessage(data.message || 'Unable to process your request.');
      }
    } catch {
      setIsError(true);
      setMessage('A network error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4 sm:px-6">
      {/* Background ambient medical grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="glass-panel mx-auto rounded-3xl p-7 sm:p-9 shadow-2xl shadow-teal-500/5">
          {/* Header */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Credential Recovery</span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Forgot Password
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Enter your author email address and we&apos;ll send you a secure, time-limited link to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Author Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="premium-input !py-3 !pl-11"
                    placeholder="author@institution.edu"
                    aria-label="Email address"
                    disabled={busy}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="premium-button flex w-full items-center justify-center gap-2 !py-3.5 text-xs font-bold disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending Reset Link…</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5 text-xs leading-relaxed text-teal-900 dark:text-teal-200">
                <div className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>Reset Link Dispatched</span>
                </div>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  If an account exists for <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched. Please check your inbox and spam folder.
                </p>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  The link will expire in 30 minutes.
                </p>
              </div>

              {/* Development / Offline Direct Link Helper */}
              {devResetUrl && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Local Test Helper (Email service inactive)</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Click below to open the reset screen directly:
                  </p>
                  <a
                    href={devResetUrl}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                  >
                    <span>Open Password Reset Screen →</span>
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setDevResetUrl(null);
                }}
                className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                Send to a different email address
              </button>
            </div>
          )}

          {/* Error Message */}
          {message && isError && (
            <div
              role="alert"
              className="mt-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{message}</span>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="mt-8 border-t border-slate-200/70 pt-5 text-center text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 font-bold text-teal-600 hover:underline dark:text-teal-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
