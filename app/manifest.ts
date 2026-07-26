import type { MetadataRoute } from 'next';

export default function manifest():MetadataRoute.Manifest{return {
  name:'Hum Medicals',
  short_name:'Hum Medicals',
  description:'Clinical learning, ECG practice, AI support, and free medical publishing.',
  start_url:'/',
  display:'standalone',
  background_color:'#071a29',
  theme_color:'#0d766f',
  icons:[{src:'/hum-medicals-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},{src:'/hum-medicals-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}],
};}
