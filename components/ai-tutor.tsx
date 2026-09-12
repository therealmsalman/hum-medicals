'use client';

import { Bot, Check, Copy, GripHorizontal, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';

type SelectionState = { text: string; left: number; top: number };
type Position = { x: number; y: number };
const defaultPosition = () => ({
  x: typeof window === 'undefined' ? 0 : window.innerWidth - 85,
  y: typeof window === 'undefined' ? 0 : window.innerHeight - 85,
});

const promptChips = [
  'Explain in clear clinical steps',
  'Key differential diagnoses',
  'ECG interpretation sequence',
  'Pathophysiology summary',
];

export function AiTutor() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectionState | null>(null);
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; origin: Position; moved: boolean } | null>(null);
  const suppressOpen = useRef(false);

  useEffect(() => {
    setPosition(defaultPosition());
  }, []);

  useEffect(() => {
    const captureSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text.length < 6 || !selection || selection.rangeCount === 0) {
        setSelected(null);
        return;
      }
      const anchor = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
      if (anchor?.closest('[data-ai-tutor]')) return;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      setSelected({
        text: text.slice(0, 5000),
        left: Math.min(Math.max(rect.left + rect.width / 2, 96), window.innerWidth - 96),
        top: Math.max(rect.top - 12, 20),
      });
    };
    document.addEventListener('mouseup', captureSelection);
    document.addEventListener('keyup', captureSelection);
    return () => {
      document.removeEventListener('mouseup', captureSelection);
      document.removeEventListener('keyup', captureSelection);
    };
  }, []);

  useEffect(() => {
    const keepInView = () =>
      setPosition((current) =>
        current
          ? {
              x: Math.min(Math.max(current.x, 38), window.innerWidth - 38),
              y: Math.min(Math.max(current.y, 38), window.innerHeight - 38),
            }
          : defaultPosition()
      );
    window.addEventListener('resize', keepInView);
    return () => window.removeEventListener('resize', keepInView);
  }, []);

  function askAboutSelection() {
    if (!selected) return;
    setContext(selected.text);
    setQuestion('Explain this clinical concept in structured, clear steps:');
    setAnswer('');
    setMessage('');
    setOpen(true);
    setSelected(null);
    window.getSelection()?.removeAllRanges();
  }

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (!position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: position, moved: false };
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) active.moved = true;
    setPosition({
      x: Math.min(Math.max(active.origin.x + dx, 38), window.innerWidth - 38),
      y: Math.min(Math.max(active.origin.y + dy, 38), window.innerHeight - 38),
    });
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    suppressOpen.current = active.moved;
    drag.current = null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setMessage('');
    setAnswer('');
    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Unable to answer right now.');
        return;
      }
      setAnswer(data.text || 'No answer was generated.');
    } catch {
      setMessage('Unable to reach the AI Tutor. Please check connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  function copyAnswer() {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const floatingStyle = position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 };
  const panelStyle =
    position && typeof window !== 'undefined'
      ? {
          left: Math.min(Math.max(position.x - 225, 16), Math.max(16, window.innerWidth - 466)),
          top: Math.min(Math.max(position.y - 620, 16), Math.max(16, window.innerHeight - 736)),
        }
      : undefined;

  return (
    <div data-ai-tutor>
      {selected && (
        <button
          type="button"
          onClick={askAboutSelection}
          style={{ left: selected.left, top: selected.top }}
          className="fixed z-[70] -translate-x-1/2 -translate-y-full rounded-full border border-teal-400/40 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-teal-700"
        >
          <Sparkles className="mr-1.5 inline text-teal-300" size={13} />
          Ask AI Tutor
        </button>
      )}

      {/* Floating Action Button */}
      <div className="tutor-float-anchor" style={floatingStyle}>
        {!open && (
          <button
            type="button"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onClick={() => {
              if (!suppressOpen.current) {
                setOpen(true);
                setSelected(null);
              }
              suppressOpen.current = false;
            }}
            aria-label="Open or move AI Tutor"
            className="tutor-float-button group relative"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            <Bot size={22} className="transition-transform group-hover:rotate-6" />
            <span className="tutor-float-label">AI Tutor</span>
          </button>
        )}
      </div>

      {/* Popover Panel */}
      {open && (
        <aside style={panelStyle} className="tutor-panel">
          <header className="tutor-panel-header">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 text-slate-950 shadow-sm">
                <Bot size={18} />
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white">Hum Medicals AI Tutor</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">Clinical Learning Copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                aria-label="Drag tutor to another place"
                title="Drag to move"
                className="tutor-drag-handle rounded-lg hover:bg-white/10"
              >
                <GripHorizontal size={19} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Tutor"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 text-sm">
            {/* Quick Chips */}
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Suggested clinical prompts:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuestion(chip)}
                    className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {context && (
              <div className="mb-4 rounded-xl border border-teal-500/30 bg-teal-50/70 p-3.5 text-xs text-teal-950 dark:bg-teal-950/40 dark:text-teal-200">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-teal-800 dark:text-teal-300">Selected Page Text</strong>
                  <button
                    type="button"
                    onClick={() => setContext('')}
                    className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
                  >
                    Clear
                  </button>
                </div>
                <p className="mt-1 line-clamp-3 leading-relaxed text-slate-700 dark:text-slate-300">{context}</p>
              </div>
            )}

            {message && (
              <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {message}
              </div>
            )}

            {answer ? (
              <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Clinical Explanation
                  </span>
                  <button
                    type="button"
                    onClick={copyAnswer}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {copied ? <Check size={13} className="text-teal-500" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">{answer}</div>
              </div>
            ) : !busy ? (
              <div className="my-8 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="mx-auto mb-2 opacity-40" size={32} />
                <p className="text-xs">Ask a question or highlight text on any page.</p>
              </div>
            ) : (
              <div className="my-8 flex items-center justify-center gap-3 text-xs text-teal-600 dark:text-teal-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                Synthesizing evidence-informed explanation…
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <label className="sr-only" htmlFor="tutor-question">
              Ask the AI Tutor
            </label>
            <textarea
              id="tutor-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              maxLength={1500}
              className="premium-input resize-none text-xs"
              placeholder="Ask about a rhythm, diagnostic criteria, physiology, or article concept…"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                For education only. Correlate with clinical guidance.
              </p>
              <button
                disabled={busy || !question.trim()}
                className="premium-button shrink-0 gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <Send size={13} /> {busy ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </form>
        </aside>
      )}
    </div>
  );
}

