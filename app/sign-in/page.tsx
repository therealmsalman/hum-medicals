import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata={title:'Sign in'};
export default function SignIn(){return <section className="bg-[#eceeea] px-5 py-20 dark:bg-slate-950"><Suspense fallback={<div className="mx-auto max-w-md p-9 text-center text-sm">Loading sign in…</div>}><AuthForm mode="signin"/></Suspense></section>}
