import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms';
import { Mail, Youtube, Share2, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Editorial Desk | Hum Medicals',
  description: 'Get in touch with the Hum Medicals editorial and clinical team for inquiries, manuscript feedback, or collaboration.',
};

export default function Contact() {
  return (
    <div className="relative py-16 md:py-24">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Editorial Communication</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Get in Touch with Hum Medicals
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
          Have a question regarding clinical tutorials, manuscript submission, educational partnerships, or peer review? We welcome dialogue from learners, educators, and clinicians worldwide.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr]">
          {/* Left: Contact Channels */}
          <div className="space-y-6">
            <div className="glass-panel space-y-4 rounded-3xl p-6 sm:p-7">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Direct Channels
              </h3>

              <div className="space-y-3">
                <a
                  href="mailto:hummedicals@gmail.com"
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition hover:border-teal-500/50 hover:bg-teal-500/5 dark:border-white/5 dark:bg-obsidian/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Direct Email</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">hummedicals@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://youtube.com/@hummedicals?si=IzPk4aOA989NKqwN"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition hover:border-red-500/50 hover:bg-red-500/5 dark:border-white/5 dark:bg-obsidian/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <Youtube className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">YouTube Channel</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">@hummedicals</p>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/share/1HAh1AoLzh/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition hover:border-blue-500/50 hover:bg-blue-500/5 dark:border-white/5 dark:bg-obsidian/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Community Social</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Hum Medicals on Facebook</p>
                  </div>
                </a>
              </div>
            </div>

            {/* SLA & Ethical assurance */}
            <div className="glass-panel space-y-3 rounded-3xl p-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Clock className="h-4 w-4 text-teal-500" />
                <span>Editorial Response Time</span>
              </div>
              <p className="leading-relaxed">
                We typically review and reply to academic inquiries and author correspondence within 24 to 48 business hours.
              </p>
              <div className="flex items-center gap-2 pt-1 font-semibold text-teal-700 dark:text-teal-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Confidential Editorial Treatment</span>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
