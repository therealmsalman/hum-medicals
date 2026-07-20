import { NextResponse } from 'next/server';

const endpoint='https://generativelanguage.googleapis.com/v1beta/models';

function cleanPlainText(value:string){
  return value
    .replace(/```[\s\S]*?```/g,'')
    .replace(/^\s{0,3}#{1,6}\s*/gm,'')
    .replace(/\*\*(.*?)\*\*/g,'$1')
    .replace(/__(.*?)__/g,'$1')
    .replace(/`([^`]+)`/g,'$1')
    .replace(/\\\[([\s\S]*?)\\\]/g,'$1')
    .replace(/\\\(([\s\S]*?)\\\)/g,'$1')
    .replace(/\$([^$]+)\$/g,'$1')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
}

export async function POST(request:Request){
  const key=process.env.GEMINI_API_KEY;
  if(!key)return NextResponse.json({message:'AI tools are not configured. Add GEMINI_API_KEY to this Vercel project’s Production environment, then redeploy.'},{status:503});
  let input:{mode?:'article';topic?:string;audience?:string;focus?:string};
  try{input=await request.json();}catch{return NextResponse.json({message:'Invalid request.'},{status:400});}
  const topic=input.topic?.trim();
  if(input.mode!=='article'||!topic||topic.length>5000)return NextResponse.json({message:'Provide a concise article topic.'},{status:400});
  const audience=input.audience?.trim()||'medical students and healthcare professionals';
  const focus=input.focus?.trim()||'cardiology and clinical medicine';
  const prompt=`Write a rigorous, educational medical article for ${audience} about: ${topic}. Focus: ${focus}. Use these plain-text section titles: Overview, Clinical context, Stepwise approach, Key interpretation points, Safety and limitations, Learning summary. Write in clear professional prose with short paragraphs and simple hyphen bullet lists where useful. Plain text only: do not use Markdown, hashtags, asterisks, underscores, tables, code blocks, equations, LaTex, dollar signs, or citations. Do not provide individual medical advice, do not invent references, and clearly state when specialist assessment or local protocols are required.`;
  try{
    const response=await fetch(`${endpoint}/${process.env.GEMINI_MODEL||'gemini-3.5-flash'}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
    const payload=await response.json();
    if(!response.ok)return NextResponse.json({message:payload?.error?.message||'Gemini could not complete the request.'},{status:response.status});
    const raw=payload?.candidates?.[0]?.content?.parts?.map((part:{text?:string})=>part.text||'').join('')||'No response was generated.';
    return NextResponse.json({text:cleanPlainText(raw)});
  }catch{return NextResponse.json({message:'Unable to reach the AI service. Check your server configuration and try again.'},{status:502});}
}
