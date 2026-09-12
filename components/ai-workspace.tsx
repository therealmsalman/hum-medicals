'use client';

import { Check, Clipboard, Download, FileText, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

type Result = { text: string };
const sectionTitles = new Set([
  'Overview',
  'Clinical context',
  'Stepwise approach',
  'Key interpretation points',
  'Safety and limitations',
  'Learning summary',
]);

const clinicalPresets = [
  'A practical framework for ECG localization in acute STEMI',
  'Bedside assessment of undifferentiated cardiogenic shock',
  'Atrial fibrillation rate vs. rhythm control strategies',
  'Diagnostic approach to acute dyspnea on clinical rounds',
];

function safeFilename(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 70) || 'hum-medicals-article'
  );
}

export function AiWorkspace() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Medical students and healthcare professionals');
  const [focus, setFocus] = useState('Cardiology and clinical medicine');
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setActionMessage('');
    setResult(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'article', topic, audience, focus }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Unable to generate an article.');
        return;
      }
      setResult(data);
    } catch {
      setMessage('Unable to reach the article generator. Please check connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyArticle() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch {
      const area = document.createElement('textarea');
      area.value = result.text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setActionMessage('Draft copied to clipboard.');
    setTimeout(() => setActionMessage(''), 3000);
  }

  async function exportWord() {
    if (!result) return;
    setExporting(true);
    setActionMessage('');
    try {
      const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
      const children = [
        new Paragraph({ text: topic, heading: HeadingLevel.TITLE, spacing: { after: 160 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Hum Medicals AI educational draft | Audience: ${audience} | Focus: ${focus}`,
              italics: true,
              color: '52616B',
              size: 20,
            }),
          ],
          spacing: { after: 280 },
        }),
        ...result.text.split(/\n+/).map((line) => {
          const text = line.trim();
          if (sectionTitles.has(text))
            return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } });
          if (text.startsWith('- '))
            return new Paragraph({ text: text.slice(2), bullet: { level: 0 }, spacing: { after: 120 } });
          return new Paragraph({ text, spacing: { after: 120, line: 264 } });
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Educational draft only. Verify important information against current clinical guidelines, original sources, and local protocols.',
              italics: true,
              color: '52616B',
              size: 18,
            }),
          ],
          spacing: { before: 240 },
        }),
      ];
      const documentFile = new Document({
        creator: 'Hum Medicals',
        title: topic,
        description: 'AI-generated educational article draft',
        styles: {
          default: { document: { run: { font: 'Calibri', size: 22 }, paragraph: { spacing: { after: 120, line: 264 } } } },
        },
        sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
      });
      const blob = await Packer.toBlob(documentFile);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${safeFilename(topic)}-hum-medicals.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setActionMessage('Word document (.docx) downloaded.');
      setTimeout(() => setActionMessage(''), 3000);
    } catch {
      setActionMessage('Unable to create Word document.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Configuration Sidebar Form */}
      <form onSubmit={submit} className="paper-panel p-6 lg:col-span-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          <Wand2 size={15} /> Generation Parameters
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Generate Teaching Draft
        </h2>

        {/* Clinical Presets */}
        <div className="mt-5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Clinical Topic Presets:
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {clinicalPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTopic(preset)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-xs text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white" htmlFor="topic-input">
              Topic or Diagnostic Question *
            </label>
            <textarea
              id="topic-input"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
              rows={4}
              className="premium-input mt-1.5 resize-none text-xs"
              placeholder="e.g. A stepwise approach to bedside interpretation of right heart strain on echocardiography…"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white" htmlFor="audience-input">
              Target Audience
            </label>
            <input
              id="audience-input"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="premium-input mt-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white" htmlFor="focus-input">
              Clinical Speciality Focus
            </label>
            <input
              id="focus-input"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              className="premium-input mt-1.5 text-xs"
            />
          </div>
        </div>

        <button
          disabled={busy || !topic.trim()}
          className="premium-button mt-6 w-full gap-2 text-xs font-bold disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Synthesizing Medical Draft…
            </>
          ) : (
            <>
              <Sparkles size={15} /> Generate Educational Article
            </>
          )}
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
          Generated drafts adhere to structured clinical sections (Overview, Clinical Context, Stepwise Approach, Key Interpretation, Safety & Limitations, Learning Summary). Verify all claims against original literature.
        </p>
      </form>

      {/* Draft Viewport */}
      <section className="paper-panel flex min-h-[520px] flex-col p-6 lg:col-span-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Output Workspace
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Generated Article Draft
            </h3>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyArticle}
                className="outline-button gap-1.5 px-3 py-1.5 text-xs font-semibold"
              >
                <Clipboard size={14} /> Copy
              </button>
              <button
                type="button"
                onClick={exportWord}
                disabled={exporting}
                className="premium-button gap-1.5 px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                <Download size={14} /> {exporting ? 'Preparing docx…' : 'Export Word'}
              </button>
            </div>
          )}
        </div>

        {message && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-50 p-4 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            {message}
          </div>
        )}

        {actionMessage && (
          <div role="status" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
            <Check size={14} /> {actionMessage}
          </div>
        )}

        {!result && !busy && (
          <div className="my-auto py-16 text-center text-slate-400 dark:text-slate-500">
            <FileText className="mx-auto mb-3 opacity-30" size={44} />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No draft generated yet.
            </p>
            <p className="mt-1 text-xs">
              Select a clinical preset or type a topic to generate a full educational write-up.
            </p>
          </div>
        )}

        {busy && (
          <div className="my-auto py-16 text-center text-teal-600 dark:text-teal-400">
            <Loader2 className="mx-auto mb-3 animate-spin text-teal-500" size={36} />
            <p className="text-sm font-semibold">Gemini 3.5 is drafting your educational article…</p>
            <p className="mt-1 text-xs text-slate-400">Structuring clinical context, stepwise reasoning, and safety summary.</p>
          </div>
        )}

        {result && (
          <div className="mt-6 whitespace-pre-wrap text-xs leading-relaxed text-slate-800 dark:text-slate-200 sm:text-sm">
            {result.text}
          </div>
        )}
      </section>
    </div>
  );
}

