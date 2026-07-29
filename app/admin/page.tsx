import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { topics } from '@/lib/content';
import { AdminDashboard } from '@/components/admin-dashboard';

export const metadata={title:'Editorial dashboard'};
export default async function Admin(){const user=await currentUser();if(!user||!isAdmin(user))redirect('/account');return <section className="mx-auto max-w-7xl px-5 py-16"><p className="eyebrow">Hum Medicals administration</p><h1 className="mt-2 text-5xl">Editorial dashboard</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">Review author manuscripts, run Gemini-assisted editorial screening, evaluate internal similarity signals, and approve work for publication.</p><AdminDashboard topics={topics}/></section>}
