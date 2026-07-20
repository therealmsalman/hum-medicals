'use client';
import { Check, Clipboard, Download } from 'lucide-react';
import { useState } from 'react';

type Result={text:string};
const sectionTitles=new Set(['Overview','Clinical context','Stepwise approach','Key interpretation points','Safety and limitations','Learning summary']);

function safeFilename(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,70)||'hum-medicals-article';}

export function AiWorkspace(){
  const [topic,setTopic]=useState('');
  const [audience,setAudience]=useState('Medical students and healthcare professionals');
  const [focus,setFocus]=useState('Cardiology and clinical medicine');
  const [result,setResult]=useState<Result|null>(null);
  const [message,setMessage]=useState('');
  const [actionMessage,setActionMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [exporting,setExporting]=useState(false);
  async function submit(event:React.FormEvent){
    event.preventDefault(); setBusy(true); setMessage(''); setActionMessage(''); setResult(null);
    try{
      const response=await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'article',topic,audience,focus})});
      const data=await response.json();
      if(!response.ok){setMessage(data.message||'Unable to generate an article.');return;}
      setResult(data);
    }catch{setMessage('Unable to reach the article generator. Please try again.');}
    finally{setBusy(false);}
  }
  async function copyArticle(){
    if(!result)return;
    try{
      await navigator.clipboard.writeText(result.text);
    }catch{
      const area=document.createElement('textarea'); area.value=result.text; area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    }
    setActionMessage('Article copied to your clipboard.');
  }
  async function exportWord(){
    if(!result)return;
    setExporting(true); setActionMessage('');
    try{
      const { Document, HeadingLevel, Packer, Paragraph, TextRun }=await import('docx');
      const children=[
        new Paragraph({text:topic,heading:HeadingLevel.TITLE,spacing:{after:160}}),
        new Paragraph({children:[new TextRun({text:`Hum Medicals AI educational draft | Audience: ${audience} | Focus: ${focus}`,italics:true,color:'52616B',size:20})],spacing:{after:280}}),
        ...result.text.split(/\n+/).map(line=>{
          const text=line.trim();
          if(sectionTitles.has(text)) return new Paragraph({text,heading:HeadingLevel.HEADING_1,spacing:{before:240,after:120}});
          if(text.startsWith('- ')) return new Paragraph({text:text.slice(2),bullet:{level:0},spacing:{after:120}});
          return new Paragraph({text,spacing:{after:120,line:264}});
        }),
        new Paragraph({children:[new TextRun({text:'Educational draft only. Verify important information against current clinical guidelines, original sources, and local protocols.',italics:true,color:'52616B',size:18})],spacing:{before:240}}),
      ];
      const documentFile=new Document({
        creator:'Hum Medicals',
        title:topic,
        description:'AI-generated educational article draft',
        styles:{
          default:{document:{run:{font:'Calibri',size:22},paragraph:{spacing:{after:120,line:264}}}},
        },
        sections:[{properties:{page:{margin:{top:1440,right:1440,bottom:1440,left:1440}}},children}],
      });
      const blob=await Packer.toBlob(documentFile);
      const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`${safeFilename(topic)}-hum-medicals.docx`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
      setActionMessage('Editable Word document downloaded.');
    }catch{setActionMessage('Unable to create the Word document. Please try again.');}
    finally{setExporting(false);}
  }
  return <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr]"><form onSubmit={submit} className="paper-panel p-7"><p className="eyebrow">AI writing assistant</p><h2 className="mt-3 text-3xl">Create an educational article</h2><label className="mt-6 block text-sm font-bold">Topic or question<textarea value={topic} onChange={event=>setTopic(event.target.value)} required rows={5} className="premium-input mt-2" placeholder="e.g. A practical introduction to ECG localisation in STEMI"/></label><label className="mt-4 block text-sm font-bold">Audience<input value={audience} onChange={event=>setAudience(event.target.value)} className="premium-input mt-2"/></label><label className="mt-4 block text-sm font-bold">Focus<input value={focus} onChange={event=>setFocus(event.target.value)} className="premium-input mt-2"/></label><button disabled={busy} className="premium-button mt-6 w-full disabled:opacity-50">{busy?'Writing…':'Generate educational article'}</button><p className="mt-5 text-xs leading-5 text-slate-500">The generator produces clean, plain-text educational drafts. Verify important claims against original sources, clinical guidelines, and local protocols.</p></form><section className="paper-panel min-h-[460px] p-7"><div className="flex flex-wrap items-center justify-between gap-3"><p className="eyebrow">Article draft</p>{result&&<div className="flex flex-wrap gap-2"><button type="button" onClick={copyArticle} className="outline-button inline-flex items-center gap-2 px-3 py-2 text-xs"><Clipboard size={15}/>Copy</button><button type="button" onClick={exportWord} disabled={exporting} className="premium-button inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"><Download size={15}/>{exporting?'Preparing…':'Export Word'}</button></div>}</div>{message&&<p role="alert" className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800">{message}</p>}{actionMessage&&<p role="status" className="mt-5 inline-flex items-center gap-2 border-l-4 border-teal bg-teal-50 p-3 text-sm text-teal-900"><Check size={16}/>{actionMessage}</p>}{!result&&!message&&<p className="mt-8 text-lg leading-8 text-slate-500">Enter a topic and the assistant will prepare a clean, evidence-aware educational article here.</p>}{result&&<div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-200">{result.text}</div>}</section></div>;
}
