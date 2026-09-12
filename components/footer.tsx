import Link from 'next/link';
import Image from 'next/image';
import { Activity, ArrowUpRight, HeartHandshake, ShieldCheck, Sparkles, Youtube } from 'lucide-react';
import { InstallAppButton } from '@/components/install-app';

export function Footer() {
  return (
    <footer className="mt-28 border-t border-slate-200/80 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-[#070b13]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/hum-medicals-logo.png"
                alt="Hum Medicals"
                width={88}
                height={88}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-teal-500/30"
              />
              <span className="text-xl font-bold tracking-tight text-white">Hum Medicals</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              A high-precision clinical education and peer publishing platform for medical students, clinicians, and healthcare scholars.
            </p>

            {/* Live Platform Badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              Gemini 3.5 AI Engine Online
            </div>

            <div className="mt-6">
              <InstallAppButton />
            </div>
          </div>

          {/* Clinical Library */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Clinical Library</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/publications" className="transition-colors hover:text-white">
                  Peer Publications (150)
                </Link>
              </li>
              <li>
                <Link href="/articles" className="transition-colors hover:text-white">
                  Practical Guides (150)
                </Link>
              </li>
              <li>
                <Link href="/ecg" className="transition-colors hover:text-white">
                  ECG Case Library (100)
                </Link>
              </li>
              <li>
                <Link href="/topics" className="transition-colors hover:text-white">
                  Speciality Topics
                </Link>
              </li>
              <li>
                <Link href="/published/all" className="text-slate-400 transition-colors hover:text-teal-300">
                  Approved Community Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Publishing */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Tools & Publishing</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/ai-tools" className="flex items-center gap-1 transition-colors hover:text-white">
                  <Sparkles size={14} className="text-teal-400" /> AI Studio
                </Link>
              </li>
              <li>
                <Link href="/publish" className="transition-colors hover:text-white">
                  Publish With Us (Free)
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition-colors hover:text-white">
                  Author Workspace
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="transition-colors hover:text-white">
                  Journal Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Connect */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Founder & Institute</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Founded by <strong className="text-slate-200">Muhammad Salman</strong> (BS Cardiology Technology, Final Year) at <span className="text-teal-300">Khyber Medical University (KMU-IHS)</span>.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <a
                href="https://youtube.com/@hummedicals?si=IzPk4aOA989NKqwN"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-rose-400 transition-colors hover:text-rose-300"
              >
                <Youtube size={16} /> Hum Medicals YouTube <ArrowUpRight size={14} />
              </a>
              <Link href="/about" className="transition-colors hover:text-white">
                About Founder & Mission
              </Link>
              <Link href="/contact" className="transition-colors hover:text-white">
                Contact Editorial Team
              </Link>
              <a href="mailto:hummedicals@gmail.com" className="text-xs text-slate-400 hover:text-white">
                hummedicals@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Hum Medicals. All rights reserved. Open-access clinical learning.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={14} className="text-teal-500" />
            <span>Educational resource · Not a replacement for professional clinical judgment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

