import { NextResponse } from 'next/server';
import { isEmailDeliveryConfigured, sendSubscriptionConfirmation } from '@/lib/email';
import { addSubscriber } from '@/lib/subscribers';

export async function POST(request:Request){try{const {email}=await request.json();if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({message:'Enter a valid email address.'},{status:400});const result=await addSubscriber(email);if(result.created&&isEmailDeliveryConfigured())await sendSubscriptionConfirmation(result.subscriber.email);return NextResponse.json({message:result.created?(isEmailDeliveryConfigured()?'Subscription successful. A welcome email is on its way.':'Subscription successful. You will receive Hum Medicals updates.'):'This email is already subscribed.'});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:'Unable to subscribe right now.'},{status:503});}}
