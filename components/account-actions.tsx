'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AccountActions({name}:{name:string}){const [busy,setBusy]=useState(false);const router=useRouter();async function signOut(){setBusy(true);await fetch('/api/auth/signout',{method:'POST'});router.push('/');router.refresh();}return <div className="paper-panel mt-8 flex flex-wrap items-center justify-between gap-4 p-6"><p className="text-sm text-slate-600 dark:text-slate-300">You are signed in securely. Your author profile can now be used for submissions.</p><button disabled={busy} onClick={signOut} className="outline-button">{busy?'Signing out…':'Sign out'}</button></div>}
