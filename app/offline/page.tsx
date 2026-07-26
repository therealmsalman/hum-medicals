import Link from 'next/link';

export default function Offline(){return <section className="mx-auto max-w-2xl px-5 py-28 text-center"><p className="eyebrow">Hum Medicals</p><h1 className="mt-4 text-5xl">You are offline.</h1><p className="mx-auto mt-6 max-w-lg leading-8 text-slate-600 dark:text-slate-300">Reconnect to continue exploring clinical resources. Previously visited pages may still be available from your browser cache.</p><Link href="/" className="premium-button mt-8">Try again</Link></section>}
