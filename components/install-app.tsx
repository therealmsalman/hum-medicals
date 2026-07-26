'use client';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

type DeferredPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};

export function InstallAppButton(){const [prompt,setPrompt]=useState<DeferredPrompt|null>(null);const [message,setMessage]=useState('');useEffect(()=>{const save=(event:Event)=>{event.preventDefault();setPrompt(event as DeferredPrompt);};const installed=()=>{setPrompt(null);setMessage('Hum Medicals is installed.');};window.addEventListener('beforeinstallprompt',save);window.addEventListener('appinstalled',installed);return()=>{window.removeEventListener('beforeinstallprompt',save);window.removeEventListener('appinstalled',installed);};},[]);async function install(){if(!prompt){setMessage('Use your browser menu and choose Install app or Add to Home Screen.');return;}await prompt.prompt();const choice=await prompt.userChoice;setPrompt(null);setMessage(choice.outcome==='accepted'?'Hum Medicals is installed.':'Installation was cancelled.');}return <div><button onClick={install} className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:text-white"><Download size={16}/>{prompt?'Install Hum Medicals app':'Install app'}</button>{message&&<p role="status" className="mt-2 max-w-xs text-xs leading-5 text-slate-400">{message}</p>}</div>;}
