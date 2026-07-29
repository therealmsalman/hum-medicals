import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { createSubmission } from '@/lib/submissions';
import { topics } from '@/lib/content';

const allowedTypes=['Research article','Review article','Case study','Educational article'];
export async function POST(request:Request){
  try{
    const user=await currentUser();
    if(!user)return NextResponse.json({message:'Sign in to submit your manuscript.'},{status:401});
    const {title,type,topic,abstract,manuscript,consent}=await request.json();
    if(typeof title!=='string'||title.trim().length<8||title.trim().length>220)return NextResponse.json({message:'Enter a manuscript title between 8 and 220 characters.'},{status:400});
    if(!allowedTypes.includes(type))return NextResponse.json({message:'Choose a valid manuscript type.'},{status:400});
    if(typeof topic!=='string'||!topics.includes(topic))return NextResponse.json({message:'Choose a valid clinical topic.'},{status:400});
    if(typeof abstract!=='string'||abstract.trim().length<80||abstract.trim().length>12000)return NextResponse.json({message:'Enter an abstract or summary between 80 and 12,000 characters.'},{status:400});
    if(typeof manuscript!=='string'||manuscript.trim().length<300||manuscript.trim().length>50000)return NextResponse.json({message:'Enter the complete manuscript between 300 and 50,000 characters.'},{status:400});
    if(consent!==true)return NextResponse.json({message:'Confirm the ethics and originality statement before submitting.'},{status:400});
    const submission=await createSubmission({authorId:user.id,authorName:user.name,authorEmail:user.email,title:title.trim(),type,topic,abstract:abstract.trim(),manuscript:manuscript.trim()});
    return NextResponse.json({submission:{id:submission.id,status:submission.status,createdAt:submission.createdAt},message:`Paper submitted and now under review. Your reference is ${submission.id}.`},{status:201});
  }catch(error){return NextResponse.json({message:error instanceof Error?error.message:'Unable to submit your manuscript.'},{status:503});}
}
