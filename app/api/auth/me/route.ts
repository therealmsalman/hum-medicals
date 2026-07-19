import { NextResponse } from 'next/server';
import { currentUser, publicUser } from '@/lib/auth';
export async function GET(){const user=currentUser();return NextResponse.json({user:user?publicUser(user):null});}
