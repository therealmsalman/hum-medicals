import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Free Author Account | Hum Medicals',
  description: 'Register as an author with Hum Medicals to publish medical papers and case studies with zero publication fees.',
};

export default function SignUp() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4 sm:px-6">
      {/* Background ambient medical grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="glass-panel mx-auto max-w-md rounded-3xl p-12 text-center text-xs text-slate-500">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <p className="mt-3">Loading registration gateway…</p>
            </div>
          }
        >
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
