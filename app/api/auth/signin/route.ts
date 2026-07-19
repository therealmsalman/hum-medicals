import { NextResponse } from 'next/server';
import { authenticate, publicUser, setSession } from '@/lib/auth';
export async function POST(request:Request){const {email,password}=await request.json();if(typeof email!=='string'||typeof password!=='string')return NextResponse.json({message:'Email and password are required.'},{status:400});const user=authenticate(email,password);if(!user)return NextResponse.json({message:'Incorrect email or password.'},{status:401});setSession(user);return NextResponse.json({user:publicUser(user)});}
