import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Hum Medicals',
  description: 'Sign in to access your Hum Medicals author cockpit, manage submitted manuscripts, and track editorial review.',
};

export default function SignIn() {
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
              <p className="mt-3">Loading secure sign-in portal…</p>
            </div>
          }
        >
          <AuthForm mode="signin" />
        </Suspense>
      </div>
    </div>
  );
}
