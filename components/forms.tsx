'use client';

import { useState } from 'react';
import { Mail, User, Send, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsSuccess(false);
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setMessage(result.message || 'Unable to subscribe right now.');

      if (response.ok) {
        setIsSuccess(true);
        setEmail('');
        window.localStorage.setItem('hum-medicals:subscribed', 'true');
        window.dispatchEvent(new Event('hum-medicals:subscribed'));
      } else {
        setIsSuccess(false);
      }
    } catch {
      setMessage('Unable to subscribe right now. Please try again.');
      setIsSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={submit} className="relative flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="newsletter-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="premium-input w-full !py-3.5 !pl-11 text-sm shadow-sm"
            placeholder="colleague@hospital.org"
            type="email"
            required
            disabled={busy}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="premium-button flex shrink-0 items-center justify-center gap-2 !py-3.5 !px-6 text-sm disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Joining…</span>
            </>
          ) : (
            <>
              <span>Subscribe Free</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {message && (
        <div
          role="status"
          className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs leading-relaxed ${
            isSuccess
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              : 'border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export function ContactForm() {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage('');

    const fields = new FormData(form);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          subject: fields.get('subject'),
          message: fields.get('message'),
        }),
      });
      const result = await response.json();
      setMessage(result.message || 'Unable to send your message right now.');

      if (response.ok) {
        setIsSuccess(true);
        form.reset();
        if (result.mailto) {
          window.location.href = result.mailto;
        }
      } else {
        setIsSuccess(false);
      }
    } catch {
      setMessage('Network error. Unable to send your message right now.');
      setIsSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass-panel space-y-4 rounded-3xl p-6 sm:p-8"
    >
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Your Full Name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="name"
            required
            minLength={2}
            aria-label="Name"
            className="premium-input !py-3 !pl-11"
            placeholder="Dr. / Colleague Name"
            disabled={busy}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="email"
            required
            type="email"
            aria-label="Email"
            className="premium-input !py-3 !pl-11"
            placeholder="doctor@hospital.org"
            disabled={busy}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Subject Line
        </label>
        <input
          name="subject"
          required
          minLength={3}
          maxLength={180}
          aria-label="Subject"
          className="premium-input !py-3"
          placeholder="e.g. Editorial Question / Clinical Case Discussion"
          disabled={busy}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Message & Details
        </label>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          aria-label="Message"
          rows={5}
          className="premium-input leading-relaxed"
          placeholder="How can our clinical editorial team help you?"
          disabled={busy}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="premium-button flex items-center gap-2 !py-3 !px-7 text-xs disabled:opacity-50"
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Sending Message…</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Send Direct Message</span>
          </>
        )}
      </button>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-2xl p-4 text-xs leading-relaxed ${
            isSuccess
              ? 'border border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-200'
              : 'border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
