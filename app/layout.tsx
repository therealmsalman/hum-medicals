import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AiTutor } from '@/components/ai-tutor';
import { PwaRegistration } from '@/components/pwa-registration';
import { SiteMotion } from '@/components/site-motion';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = { metadataBase:new URL(siteUrl), title:{default:'Hum Medicals | Clinical education, clearly delivered',template:'%s | Hum Medicals'}, description:'Evidence-based cardiology and clinical education for students and healthcare professionals.', manifest:'/manifest.webmanifest', icons:{icon:'/hum-medicals-logo.png',apple:'/hum-medicals-logo.png'}, appleWebApp:{capable:true,title:'Hum Medicals',statusBarStyle:'default'}, openGraph:{type:'website',siteName:'Hum Medicals',title:'Hum Medicals',description:'Clinical education, clearly delivered.',url:siteUrl}, twitter:{card:'summary_large_image',title:'Hum Medicals',description:'Evidence-based cardiology and clinical education.'} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" suppressHydrationWarning><body><PwaRegistration/><SiteMotion/><Header/><main>{children}</main><Footer/><AiTutor/></body></html> }
