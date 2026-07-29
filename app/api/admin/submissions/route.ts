import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { getAllSubmissions } from '@/lib/submissions';

export async function GET(){const user=await currentUser();if(!isAdmin(user))return NextResponse.json({message:'Admin access is required.'},{status:403});return NextResponse.json({submissions:await getAllSubmissions()});}
