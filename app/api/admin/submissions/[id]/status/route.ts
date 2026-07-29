import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { updateSubmission } from '@/lib/submissions';

export async function POST(request:Request,{params}:{params:{id:string}}){const user=await currentUser();if(!isAdmin(user))return NextResponse.json({message:'Admin access is required.'},{status:403});let input:{status?:string;adminNote?:string}={};try{input=await request.json();}catch{}if(input.status!=='changes_requested'&&input.status!=='rejected')return NextResponse.json({message:'Choose a valid editorial status.'},{status:400});const submission=await updateSubmission(params.id,{status:input.status,adminNote:typeof input.adminNote==='string'?input.adminNote.slice(0,1200):undefined});return NextResponse.json({submission});}
