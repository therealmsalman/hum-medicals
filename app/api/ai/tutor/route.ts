import { NextResponse } from 'next/server';

const endpoint='https://generativelanguage.googleapis.com/v1beta/models';
function cleanPlainText(value:string){return value.replace(/```[\s\S]*?```/g,'').replace(/^\s{0,3}#{1,6}\s*/gm,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/__(.*?)__/g,'$1').replace(/`([^`]+)`/g,'$1').replace(/\\\[([\s\S]*?)\\\]/g,'$1').replace(/\\\(([\s\S]*?)\\\)/g,'$1').replace(/\$([^$]+)\$/g,'$1').replace(/\n{3,}/g,'\n\n').trim();}

export async function POST(request:Request){
  const key=process.env.GEMINI_API_KEY;
  if(!key)return NextResponse.json({message:'AI Tutor is not configured. Add GEMINI_API_KEY to this Vercel project Production environment, then redeploy.'},{status:503});
  let input:{question?:string;context?:string};try{input=await request.json();}catch{return NextResponse.json({message:'Invalid request.'},{status:400});}
  const question=input.question?.trim();const context=input.context?.trim().slice(0,5000)||'';
  if(!question||question.length>1500)return NextResponse.json({message:'Ask a concise question of up to 1,500 characters.'},{status:400});
  const prompt=`You are the Hum Medicals AI Tutor. Give a concise, supportive explanation for medical learners and healthcare professionals. Use plain text only: no Markdown, hashtags, asterisks, tables, code blocks, LaTex, equations, or invented references. Explain concepts step by step where helpful. Never present this as personal medical diagnosis or treatment; advise appropriate clinical supervision, local protocols, and qualified assessment when relevant.\n\nQuestion: ${question}${context?`\n\nSelected text from the Hum Medicals website:\n${context}`:''}`;
  const models=[process.env.GEMINI_TUTOR_MODEL||'gemini-3.1-flash-lite',process.env.GEMINI_MODEL||'gemini-3.5-flash'].filter((value,index,items)=>items.indexOf(value)===index);
  let quotaMessage='';
  for(const model of models){
    try{const response=await fetch(`${endpoint}/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:900,temperature:0.3}})});const payload=await response.json();if(response.ok){const raw=payload?.candidates?.[0]?.content?.parts?.map((part:{text?:string})=>part.text||'').join('')||'No response was generated.';return NextResponse.json({text:cleanPlainText(raw)});}if(response.status===429||response.status===503){quotaMessage=payload?.error?.message||'The AI provider is temporarily at capacity.';continue;}return NextResponse.json({message:payload?.error?.message||'Gemini could not answer this question.'},{status:response.status});}catch{quotaMessage='Unable to reach the AI provider.';}
  }
  return NextResponse.json({message:`The AI Tutor is temporarily busy. Please try again in a minute. ${quotaMessage}`},{status:429,headers:{'Retry-After':'60'}});
}
