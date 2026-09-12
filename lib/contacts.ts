import { getSupabase, supabaseStorageError } from './supabase';

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
};

export async function saveContactMessage(input: Omit<ContactMessage, 'receivedAt'>): Promise<ContactMessage> {
  const item: ContactMessage = { ...input, receivedAt: new Date().toISOString() };

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase.from('contact_messages').insert({
    name: item.name,
    email: item.email,
    subject: item.subject,
    message: item.message,
    received_at: item.receivedAt,
  });

  if (error) throw new Error(error.message);
  return item;
}

