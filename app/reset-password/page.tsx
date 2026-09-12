'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="glass-panel mx-auto rounded-3xl p-7 sm:p-9 text-center shadow-2xl shadow-teal-500/5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Missing Reset Token
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          This password reset link is invalid or incomplete. Please check the full URL or request a new reset link.
        </p>
        <div className="mt-6">
          <Link href="/forgot-password" className="premium-button inline-flex items-center gap-2 !py-2.5 !px-5 text-xs">
            <span>Request New Reset Link</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setBusy(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(data.message || 'Password successfully updated.');
        setTimeout(() => {
          router.push('/account');
          router.refresh();
        }, 2200);
      } else {
        setIsError(true);
        setMessage(data.message || 'Unable to reset password.');
      }
    } catch {
      setIsError(true);
      setMessage('A network error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel mx-auto rounded-3xl p-7 sm:p-9 shadow-2xl shadow-teal-500/5">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security Verification</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Choose New Password
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Enter a secure new password for your Hum Medicals author account.
        </p>
      </div>

      {!success ? (
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="new-password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="new-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="premium-input !py-3 !pl-11 !pr-11 font-mono"
                placeholder="••••••••"
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
            <span className="text-[10px] text-slate-400">Minimum 8 characters</span>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirm-password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="premium-input !py-3 !pl-11 font-mono"
                placeholder="••••••••"
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
                <span>Updating Password…</span>
              </>
            ) : (
              <>
                <span>Save New Password & Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Password Successfully Changed</span>
            </div>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              Your author password has been updated and an authenticated session has been established.
            </p>
            <p className="mt-2 font-semibold text-teal-600 dark:text-teal-400">
              Redirecting you to your author workspace now…
            </p>
          </div>

          <div className="pt-2 text-center">
            <Link href="/account" className="premium-button inline-flex items-center gap-2 !py-2.5 !px-6 text-xs">
              <span>Go to Workspace Immediately</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4 sm:px-6">
      {/* Background ambient medical grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="glass-panel mx-auto max-w-md rounded-3xl p-12 text-center text-xs text-slate-500">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              <p className="mt-3">Loading password reset portal…</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
