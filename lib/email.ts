import { Resend } from 'resend';

const emailFrom=process.env.EMAIL_FROM;
const apiKey=process.env.RESEND_API_KEY;
const contactEmail=process.env.CONTACT_EMAIL||'hummedicals@gmail.com';
const escapeHtml=(value:string)=>value.replace(/[&<>'"]/g,character=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[character]||character));

function client(){
  if(!apiKey||!emailFrom)throw new Error('Email delivery is not configured. Add RESEND_API_KEY and a verified EMAIL_FROM address, then redeploy.');
  return new Resend(apiKey);
}

export function isEmailDeliveryConfigured(){return Boolean(apiKey&&emailFrom);}

export async function sendEmail(input:{to:string;subject:string;text:string;html:string;replyTo?:string}){
  const {error}=await client().emails.send({from:emailFrom!,to:input.to,subject:input.subject,text:input.text,html:input.html,replyTo:input.replyTo});
  if(error)throw new Error(`Email delivery failed: ${error.message}`);
}

export async function sendSubscriptionConfirmation(email:string){
  const safeEmail=escapeHtml(email);
  await sendEmail({to:email,subject:'Welcome to the Hum Medicals clinical brief',text:'You are subscribed to Hum Medicals. We will send considered updates when there is something worth reading.',html:`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2031"><h1>Welcome to Hum Medicals</h1><p>You are subscribed with <strong>${safeEmail}</strong>.</p><p>We will send considered clinical-learning updates when there is something worth reading.</p><p>Hum Medicals Clinical Learning Journal</p></div>`});
}

export async function sendContactMessage(input:{name:string;email:string;subject:string;message:string}){
  const sender=escapeHtml(input.name);const senderEmail=escapeHtml(input.email);const subject=escapeHtml(input.subject);const message=escapeHtml(input.message).replace(/\n/g,'<br/>');
  await sendEmail({to:contactEmail,replyTo:input.email,subject:`Hum Medicals contact: ${input.subject}`,text:`From: ${input.name} <${input.email}>\n\n${input.message}`,html:`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2031"><h1>New contact message</h1><p><strong>From:</strong> ${sender} (${senderEmail})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p></div>`});
  await sendEmail({to:input.email,subject:'We received your Hum Medicals message',text:`Thank you for contacting Hum Medicals. We received your message about: ${input.subject}`,html:`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2031"><h1>Thank you for contacting Hum Medicals</h1><p>We received your message about: <strong>${subject}</strong>.</p><p>Our team will review it and reply to you when appropriate.</p></div>`});
}
