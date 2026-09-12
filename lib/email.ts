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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const safeEmail = escapeHtml(email);
  await sendEmail({
    to: email,
    subject: 'Reset your Hum Medicals author password',
    text: `You requested a password reset for your Hum Medicals account (${safeEmail}). Follow this link to choose a new password:\n\n${resetUrl}\n\nThis link is valid for 30 minutes. If you did not request this, you can safely disregard this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #0f172a;">
        <div style="border-bottom: 1px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #0d9488; margin: 0; font-size: 20px;">Hum Medicals</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Clinical Education & Publishing</p>
        </div>
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a;">Password Reset Request</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
          We received a request to reset the password for your author account (<strong>${safeEmail}</strong>).
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
          Click the secure button below to set a new password. For security reasons, this link will expire in <strong>30 minutes</strong>.
        </p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #0d9488; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 24px 0 8px 0;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 11px; word-break: break-all; color: #0d9488; margin: 0 0 24px 0;">
          ${resetUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
  });
}

