import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], darkMode: 'class', theme: { extend: { colors: { ink:'#11283d', clinical:'#174a6e', teal:'#0b7b76', paper:'#f7f8f6' }, fontFamily: { sans:['Arial','sans-serif'], serif:['Georgia','serif'] } } }, plugins: [] } satisfies Config;
