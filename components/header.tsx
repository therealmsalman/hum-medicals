'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Check, Menu, Moon, Sparkles, Sun, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const links = [
  ['Publications', '/publications'],
  ['Articles', '/articles'],
  ['ECG Cases', '/ecg'],
  ['AI Tools', '/ai-tools'],
  ['Topics', '/topics'],
  ['Publish', '/publish'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

const subscriptionKey = 'hum-medicals:subscribed';

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => setSignedIn(Boolean(data.user)))
      .catch(() => setSignedIn(false));
  }, []);

  useEffect(() => {
    const update = () => setSubscribed(localStorage.getItem(subscriptionKey) === 'true');
    update();
    window.addEventListener('hum-medicals:subscribed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('hum-medicals:subscribed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#090d16]/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Hum Medicals home">
          <div className="relative">
            <Image
              src="/hum-medicals-logo.png"
              alt="Hum Medicals Logo"
              width={80}
              height={80}
              priority
              className="h-10 w-10 rounded-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-teal-500 dark:border-[#090d16]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                Hum Medicals
              </span>
              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
                Platform
              </span>
            </div>
            <span className="hidden text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:block">
              Clinical learning & publishing journal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex">
          {links.map(([name, href]) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? 'bg-teal-500/10 font-bold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle dark mode"
            onClick={toggle}
            className="rounded-xl border border-slate-200/80 p-2 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          <Link
            href={signedIn ? '/account' : '/sign-in'}
            className="hidden items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 sm:flex"
          >
            <UserRound size={14} className="text-teal-600 dark:text-teal-400" />
            {signedIn ? 'My Account' : 'Sign In'}
          </Link>

          {subscribed ? (
            <span className="hidden items-center gap-1.5 rounded-xl bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 md:flex">
              <Check size={14} /> Subscribed
            </span>
          ) : (
            <Link
              href="/subscribe"
              className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-600/20 transition-all hover:from-teal-500 hover:to-teal-600 hover:shadow hover:shadow-teal-600/30 md:flex"
            >
              <Sparkles size={13} /> Subscribe
            </Link>
          )}

          <button
            aria-label="Toggle menu"
            className="rounded-xl border border-slate-200/80 p-2 text-slate-600 dark:border-slate-800 dark:text-slate-300 lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-slate-200/80 bg-white/95 px-5 py-5 backdrop-blur-xl dark:border-slate-800 dark:bg-[#090d16]/95 lg:hidden">
          <nav className="grid gap-1">
            {links.map(([name, href]) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                  href={href}
                >
                  {name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800">
            <Link
              href={signedIn ? '/account' : '/sign-in'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-teal-600 dark:text-teal-400"
            >
              <UserRound size={16} /> {signedIn ? 'My Account' : 'Sign in'}
            </Link>
            {subscribed ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-500/10 px-4 py-2.5 text-xs font-bold text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
                <Check size={14} /> Subscribed
              </span>
            ) : (
              <Link
                href="/subscribe"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                <Sparkles size={13} /> Subscribe to Newsletter
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

