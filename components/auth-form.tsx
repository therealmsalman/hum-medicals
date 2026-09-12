'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const requested = searchParams.get('next');
  const destination = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/account';
  const isSignup = mode === 'signup';
  const alternate = `${isSignup ? '/sign-in' : '/sign-up'}${requested ? `?next=${encodeURIComponent(requested)}` : ''}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget));

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
        return;
      }

      window.location.assign(destination);
    } catch {
      setBusy(false);
      setMessage('A connection error occurred. Please try again.');
    }
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
          className="mt-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{message}</span>
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
