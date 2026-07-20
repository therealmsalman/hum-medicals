'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Account={name:string;email:string};

export function PublishingPortal(){
  const [account,setAccount]=useState<Account|null>(null);
  const [message,setMessage]=useState('');
  const [submitting,setSubmitting]=useState(false);
  useEffect(()=>{fetch('/api/auth/me').then(response=>response.json()).then(data=>setAccount(data.user)).catch(()=>setAccount(null));},[]);
  async function submitWork(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!account)return;setSubmitting(true);setMessage('');
    const fields=new FormData(event.currentTarget);
    const response=await fetch('/api/publishing/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:fields.get('title'),type:fields.get('type'),abstract:fields.get('abstract'),consent:fields.get('consent')==='on'})});
    const result=await response.json();setSubmitting(false);setMessage(result.message||'Your submission has been received.');if(response.ok)event.currentTarget.reset();
  }
  return <div className="mt-12 grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><section className="paper-panel p-7"><p className="eyebrow">Author account</p><h2 className="mt-2 text-3xl">Your workspace</h2>{account?<div className="mt-6 border-l-4 border-teal bg-teal/5 p-5"><p className="font-bold text-ink dark:text-white">{account.name}</p><p className="mt-1 text-sm">{account.email}</p><Link href="/account" className="mt-4 inline-block text-sm font-bold text-teal">View submissions →</Link></div>:<div className="mt-6"><p className="text-sm leading-6">Create a free author account to submit your work.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/sign-up" className="premium-button">Create free account</Link><Link href="/sign-in" className="outline-button">Sign in</Link></div></div>}<p className="mt-5 text-xs leading-5 text-slate-500">There are no submission fees, payment steps, or publishing charges.</p></section><section className="paper-panel p-7"><p className="eyebrow">Free manuscript submission</p><h2 className="mt-2 text-3xl">Submit for editorial review</h2><form onSubmit={submitWork} className="mt-6 grid gap-4"><input name="title" required disabled={!account} minLength={8} maxLength={220} aria-label="Manuscript title" placeholder="Manuscript title" className="premium-input"/><select name="type" required disabled={!account} aria-label="Submission type" className="premium-input"><option>Research article</option><option>Review article</option><option>Case study</option><option>Educational article</option></select><textarea name="abstract" rows={6} required disabled={!account} minLength={80} maxLength={12000} aria-label="Abstract" placeholder="Structured abstract or article summary (minimum 80 characters)" className="premium-input"/><label className="flex gap-2 text-xs leading-5"><input name="consent" type="checkbox" required disabled={!account} className="mt-1"/>I confirm this work is original, does not contain identifiable patient information without appropriate consent, and is submitted for free editorial consideration. Submission does not guarantee publication.</label><button disabled={!account||submitting} className="premium-button w-fit disabled:opacity-50">{submitting?'Submitting…':'Submit manuscript free'}</button></form>{message&&<p role="status" className="mt-4 border-l-4 border-teal bg-teal/5 p-3 text-sm leading-6">{message}</p>}</section></div>;
}
