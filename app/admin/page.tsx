import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { topics } from '@/lib/content';
import { AdminDashboard } from '@/components/admin-dashboard';
import { ShieldCheck, Sparkles, Sliders } from 'lucide-react';

export const metadata = { title: 'Editorial Command Desk | Hum Medicals' };

export default async function Admin() {
  const user = await currentUser();
  if (!user || !isAdmin(user)) redirect('/account');

  return (
    <div className="relative min-h-screen py-12 md:py-16">
      {/* Subtle telemetry medical grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-6 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Editorial Board Operations</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Editorial Command Desk
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Review received manuscripts, run Gemini AI deep clinical screening, inspect similarity indices, request author revisions, and authorize open-access publication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-obsidian/80 dark:text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-teal-500" />
              <span>Admin: {user.name}</span>
            </span>
          </div>
        </div>

        <AdminDashboard topics={topics} />
      </div>
    </div>
  );
}
