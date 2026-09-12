'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, User } from 'lucide-react';

export function AccountActions({ name }: { name: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.dispatchEvent(new Event('hum-medicals:auth-change'));
      window.location.href = '/sign-in';
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Author Session</p>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Authenticated
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signed in as <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>. Your manuscripts and submissions are encrypted and synced.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={signOut}
        className="outline-button inline-flex items-center gap-2 !py-2.5 !px-5 text-xs text-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white disabled:opacity-50"
      >
        {busy ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Signing Out…</span>
          </>
        ) : (
          <>
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </>
        )}
      </button>
    </div>
  );
}
