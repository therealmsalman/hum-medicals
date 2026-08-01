'use client';

import { CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Submission } from '@/lib/submissions';

type Collection = 'paper' | 'article';
type Choices = Record<string, { topic: string; collection: Collection }>;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export function AdminDashboard({ topics }: { topics: string[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [choices, setChoices] = useState<Choices>({});

  const load = async () => {
    const response = await fetch('/api/admin/submissions');
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Unable to load submissions.');
      return;
    }
    setSubmissions(data.submissions);
    setChoices(Object.fromEntries(data.submissions.map((item: Submission) => [item.id, {
      topic: item.review?.suggestedTopic || item.topic || topics[0],
      collection: item.review?.suggestedCollection || 'article',
    }])));
  };

  useEffect(() => { load(); }, []);

  const review = async (id: string) => {
    setBusy(id); setMessage('');
    try {
      const response = await fetch(`/api/admin/submissions/${id}/review`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSubmissions(items => items.map(item => item.id === id ? data.submission : item));
      setChoices(current => ({ ...current, [id]: {
        topic: data.submission.review.suggestedTopic,
        collection: data.submission.review.suggestedCollection,
      }}));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to review this manuscript.');
    } finally { setBusy(null); }
  };

  const approve = async (id: string) => {
    setBusy(id); setMessage('');
    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(choices[id]),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSubmissions(items => items.map(item => item.id === id ? data.submission : item));
      setMessage(`Approved and published: ${data.published.title}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to approve this manuscript.');
    } finally { setBusy(null); }
  };

  const setStatus = async (id: string, status: 'changes_requested' | 'rejected') => {
    const adminNote = window.prompt(status === 'changes_requested' ? 'Optional message for the author:' : 'Optional editorial note:') || '';
    setBusy(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNote }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update editorial status.');
      setSubmissions(items => items.map(item => item.id === id ? data.submission : item));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update editorial status.');
    } finally { setBusy(null); }
  };

  const card = (item: Submission, approved = false) => {
    const choice = choices[item.id] || { topic: item.topic || topics[0], collection: 'article' as Collection };
    return <article key={item.id} className="paper-panel admin-submission-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{item.status.replaceAll('_', ' ')}</p>
          <h3 className="mt-2 font-serif text-2xl">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{item.authorName} · {item.authorEmail} · {item.type} · {dateLabel(item.createdAt)}</p>
        </div>
        {approved && item.publishedSlug ? <a className="premium-button" href={`/published/${item.publishedSlug}`}>View published work</a> : <button disabled={busy === item.id} onClick={() => review(item.id)} className="outline-button">{busy === item.id ? 'Working…' : item.review ? 'Run review again' : 'Run Gemini review'}</button>}
      </div>
      <p className="mt-5 text-sm leading-7">{item.abstract}</p>
      <details className="mt-5 border-t pt-4"><summary className="cursor-pointer text-sm font-bold text-teal">Read complete manuscript</summary><div className="mt-4 whitespace-pre-wrap text-sm leading-7">{item.manuscript}</div></details>
      {item.review && <div className="mt-5 grid gap-5 border-t pt-5 lg:grid-cols-2">
        <div><p className="text-sm font-bold">Gemini editorial review</p><p className="mt-2 text-sm leading-6">{item.review.summary}</p><p className="mt-3 text-sm"><strong>Recommendation:</strong> {item.review.recommendation}</p><p className="mt-1 text-sm"><strong>Internal similarity screen:</strong> {item.review.similarityScore}%</p>{item.review.similarityMatches.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs leading-5 text-slate-600">{item.review.similarityMatches.map(match => <li key={match.title}>{match.score}% — {match.title} ({match.source})</li>)}</ul>}</div>
        {!approved && <div><p className="text-sm font-bold">Publish controls</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={choice.topic} onChange={event => setChoices(current => ({ ...current, [item.id]: { ...choice, topic: event.target.value } }))} className="premium-input">{topics.map(topic => <option key={topic}>{topic}</option>)}</select><select value={choice.collection} onChange={event => setChoices(current => ({ ...current, [item.id]: { ...choice, collection: event.target.value as Collection } }))} className="premium-input"><option value="article">Articles</option><option value="paper">Publications</option></select></div><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy === item.id} onClick={() => approve(item.id)} className="premium-button">Approve & publish</button><button disabled={busy === item.id} onClick={() => setStatus(item.id, 'changes_requested')} className="outline-button">Request changes</button><button disabled={busy === item.id} onClick={() => setStatus(item.id, 'rejected')} className="outline-button">Reject</button></div></div>}
      </div>}
    </article>;
  };

  const pending = submissions.filter(item => item.status !== 'approved');
  const approved = submissions.filter(item => item.status === 'approved');

  return <section className="mt-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Admin editorial workflow</p><h2 className="mt-2 text-4xl">Manuscript review desk</h2></div><button onClick={load} className="outline-button">Refresh dashboard</button></div>
    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Gemini review and the similarity screen are decision-support tools. They do not make publication decisions or certify plagiarism. Only your approval publishes a manuscript.</p>
    {message && <p role="status" className="mt-5 border-l-4 border-teal bg-teal/5 p-4 text-sm">{message}</p>}
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.85fr)]">
      <section className="admin-board-area admin-pending-area"><div className="admin-board-heading"><span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700"><Clock3 size={19}/></span><div><p className="eyebrow text-amber-700">Pending approvals</p><h3 className="mt-1 font-serif text-3xl">Editorial queue <span className="admin-count">{pending.length}</span></h3></div></div><p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Review new and revised manuscripts, run the editorial assessment, and choose whether to publish.</p><div className="mt-6 grid gap-5">{pending.length ? pending.map(item => card(item)) : <div className="paper-panel p-6 text-sm">There are no manuscripts waiting for your decision.</div>}</div></section>
      <section className="admin-board-area admin-approved-area"><div className="admin-board-heading"><span className="grid h-10 w-10 place-items-center rounded-full bg-teal/15 text-teal"><CheckCircle2 size={20}/></span><div><p className="eyebrow">Approved</p><h3 className="mt-1 font-serif text-3xl">Live work <span className="admin-count">{approved.length}</span></h3></div></div><p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">A record of manuscripts that are now visible in the selected journal collection.</p><div className="mt-6 grid gap-5">{approved.length ? approved.map(item => card(item, true)) : <div className="paper-panel p-6 text-sm">Approved manuscripts will appear here after publication.</div>}</div></section>
    </div>
  </section>;
}
