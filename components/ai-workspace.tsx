'use client';
import { useState } from 'react';

type Result={text:string};

export function AiWorkspace(){
  const [topic,setTopic]=useState('');
  const [audience,setAudience]=useState('Medical students and healthcare professionals');
  const [focus,setFocus]=useState('Cardiology and clinical medicine');
  const [result,setResult]=useState<Result|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent){
    event.preventDefault(); setBusy(true); setMessage(''); setResult(null);
    try{
      const response=await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'article',topic,audience,focus})});
      const data=await response.json();
      if(!response.ok){setMessage(data.message||'Unable to generate an article.');return;}
      setResult(data);
    }catch{setMessage('Unable to reach the article generator. Please try again.');}
    finally{setBusy(false);}
  }
  return <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr]"><form onSubmit={submit} className="paper-panel p-7"><p className="eyebrow">AI writing assistant</p><h2 className="mt-3 text-3xl">Create an educational article</h2><label className="mt-6 block text-sm font-bold">Topic or question<textarea value={topic} onChange={event=>setTopic(event.target.value)} required rows={5} className="premium-input mt-2" placeholder="e.g. A practical introduction to ECG localisation in STEMI"/></label><label className="mt-4 block text-sm font-bold">Audience<input value={audience} onChange={event=>setAudience(event.target.value)} className="premium-input mt-2"/></label><label className="mt-4 block text-sm font-bold">Focus<input value={focus} onChange={event=>setFocus(event.target.value)} className="premium-input mt-2"/></label><button disabled={busy} className="premium-button mt-6 w-full disabled:opacity-50">{busy?'Writing…':'Generate educational article'}</button><p className="mt-5 text-xs leading-5 text-slate-500">The generator produces clean, plain-text educational drafts. Verify important claims against original sources, clinical guidelines, and local protocols.</p></form><section className="paper-panel min-h-[460px] p-7"><p className="eyebrow">Article draft</p>{message&&<p role="alert" className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800">{message}</p>}{!result&&!message&&<p className="mt-8 text-lg leading-8 text-slate-500">Enter a topic and the assistant will prepare a clean, evidence-aware educational article here.</p>}{result&&<div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-200">{result.text}</div>}</section></div>;
}
