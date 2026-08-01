'use client';

import { Bot, GripHorizontal, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';

type SelectionState = { text: string; left: number; top: number };
type Position = { x: number; y: number };
const defaultPosition = () => ({ x: typeof window === 'undefined' ? 0 : window.innerWidth - 80, y: typeof window === 'undefined' ? 0 : window.innerHeight - 80 });

export function AiTutor() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectionState | null>(null);
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; origin: Position; moved: boolean } | null>(null);
  const suppressOpen = useRef(false);

  useEffect(() => { setPosition(defaultPosition()); }, []);
  useEffect(() => {
    const captureSelection = () => {
      const selection = window.getSelection(); const text = selection?.toString().trim() || '';
      if (text.length < 6 || !selection || selection.rangeCount === 0) { setSelected(null); return; }
      const anchor = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
      if (anchor?.closest('[data-ai-tutor]')) return;
      const rect = selection.getRangeAt(0).getBoundingClientRect(); if (!rect.width && !rect.height) return;
      setSelected({ text: text.slice(0, 5000), left: Math.min(Math.max(rect.left + rect.width / 2, 96), window.innerWidth - 96), top: Math.max(rect.top - 12, 20) });
    };
    document.addEventListener('mouseup', captureSelection); document.addEventListener('keyup', captureSelection);
    return () => { document.removeEventListener('mouseup', captureSelection); document.removeEventListener('keyup', captureSelection); };
  }, []);

  useEffect(() => {
    const keepInView = () => setPosition(current => current ? { x: Math.min(Math.max(current.x, 38), window.innerWidth - 38), y: Math.min(Math.max(current.y, 38), window.innerHeight - 38) } : defaultPosition());
    window.addEventListener('resize', keepInView); return () => window.removeEventListener('resize', keepInView);
  }, []);

  function askAboutSelection() { if (!selected) return; setContext(selected.text); setQuestion('Explain this selected text in clear, simple steps.'); setAnswer(''); setMessage(''); setOpen(true); setSelected(null); window.getSelection()?.removeAllRanges(); }
  function startDrag(event: PointerEvent<HTMLElement>) { if (!position) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: position, moved: false }; }
  function moveDrag(event: PointerEvent<HTMLElement>) { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; const dx = event.clientX - active.startX; const dy = event.clientY - active.startY; if (Math.abs(dx) + Math.abs(dy) > 5) active.moved = true; setPosition({ x: Math.min(Math.max(active.origin.x + dx, 38), window.innerWidth - 38), y: Math.min(Math.max(active.origin.y + dy, 38), window.innerHeight - 38) }); }
  function endDrag(event: PointerEvent<HTMLElement>) { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; event.currentTarget.releasePointerCapture(event.pointerId); suppressOpen.current = active.moved; drag.current = null; }
  async function submit(event: FormEvent) { event.preventDefault(); if (!question.trim()) return; setBusy(true); setMessage(''); setAnswer(''); try { const response = await fetch('/api/ai/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context }) }); const data = await response.json(); if (!response.ok) { setMessage(data.message || 'Unable to answer right now.'); return; } setAnswer(data.text || 'No answer was generated.'); } catch { setMessage('Unable to reach the AI Tutor. Please try again.'); } finally { setBusy(false); } }
  const floatingStyle = position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 };
  const panelStyle = position && typeof window !== 'undefined' ? { left: Math.min(Math.max(position.x - 215, 16), Math.max(16, window.innerWidth - 446)), top: Math.min(Math.max(position.y - 610, 16), Math.max(16, window.innerHeight - 736)) } : undefined;
  return <div data-ai-tutor>{selected && <button type="button" onClick={askAboutSelection} style={{ left: selected.left, top: selected.top }} className="fixed z-[70] -translate-x-1/2 -translate-y-full rounded-full bg-[#0b2031] px-4 py-2 text-xs font-bold text-white shadow-xl transition hover:bg-teal"><Sparkles className="mr-1.5 inline" size={14} />Ask tutor</button>}<div className="tutor-float-anchor" style={floatingStyle}>{!open && <button type="button" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onClick={() => { if (!suppressOpen.current) { setOpen(true); setSelected(null); } suppressOpen.current = false; }} aria-label="Open or move AI Tutor" className="tutor-float-button"><Bot size={25} /><span className="tutor-float-label">AI Tutor</span></button>}</div>{open && <aside style={panelStyle} className="tutor-panel"><header className="tutor-panel-header"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal"><Bot size={18} /></span><div><p className="font-serif text-lg">Hum Medicals AI Tutor</p><p className="text-[11px] text-teal-200">Clinical learning support</p></div></div><div className="flex items-center gap-1"><button type="button" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} aria-label="Drag tutor to another place" title="Drag to move" className="tutor-drag-handle"><GripHorizontal size={20} /></button><button type="button" onClick={() => setOpen(false)} aria-label="Close AI Tutor" className="rounded-full p-1.5 transition hover:bg-white/10"><X size={19} /></button></div></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Ask a clinical-learning question, or select text anywhere on the site and choose “Ask tutor.”</p>{context && <div className="mt-4 border-l-4 border-teal bg-teal/5 p-3 text-xs leading-5 text-slate-600 dark:text-slate-300"><strong className="block text-teal">Selected text</strong>{context.length > 360 ? `${context.slice(0, 360)}…` : context}<button type="button" onClick={() => setContext('')} className="mt-2 block font-bold text-teal">Remove selection</button></div>}{message && <p role="alert" className="mt-4 border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-800">{message}</p>}{answer && <div className="mt-5 whitespace-pre-wrap border-t border-slate-200 pt-5 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:text-slate-200">{answer}</div>}</div><form onSubmit={submit} className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><label className="sr-only" htmlFor="tutor-question">Ask the AI Tutor</label><textarea id="tutor-question" value={question} onChange={event => setQuestion(event.target.value)} rows={3} maxLength={1500} className="premium-input resize-none" placeholder="Ask a question about a concept, ECG, article, or clinical topic…" /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-[10px] leading-4 text-slate-500">Educational support only. Use clinical supervision and local protocols.</p><button disabled={busy || !question.trim()} className="premium-button shrink-0 px-4 py-2.5 text-xs disabled:opacity-50">{busy ? 'Thinking…' : <><Send className="mr-1.5" size={14} />Ask</>}</button></div></form></aside>}</div>;
}
