import { NextResponse } from 'next/server';
import { sendSubscriptionConfirmation } from '@/lib/email';
import { addSubscriber } from '@/lib/subscribers';

export async function POST(request:Request){try{const {email}=await request.json();if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({message:'Enter a valid email address.'},{status:400});const result=await addSubscriber(email);if(result.created)await sendSubscriptionConfirmation(result.subscriber.email);return NextResponse.json({message:result.created?'Subscription confirmed. Please check your inbox for a welcome email.':'This email is already subscribed.'});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:'Unable to subscribe right now.'},{status:503});}}
