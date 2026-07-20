import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms';

export const metadata:Metadata={title:'Contact'};
export default function Contact(){return <section className="mx-auto max-w-5xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-wider text-teal">Get in touch</p><h1 className="mt-2 text-5xl">Contact Hum Medicals</h1><div className="mt-10 grid gap-12 md:grid-cols-2"><div><p className="leading-8">Have a question, learning suggestion, or collaboration idea? We'd be glad to hear from you.</p><p className="mt-7 text-sm font-bold">Email</p><a className="text-teal" href="mailto:hummedicals@gmail.com">hummedicals@gmail.com</a><p className="mt-7 text-sm font-bold">Social</p><a className="text-teal" href="https://youtube.com/@hummedicals?si=IzPk4aOA989NKqwN" target="_blank" rel="noreferrer">Hum Medicals on YouTube</a></div><ContactForm/></div></section>}
