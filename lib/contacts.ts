import fs from 'fs';
import path from 'path';
import { getSupabase, supabaseStorageError } from './supabase';

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
};

const contactsPath = path.join(process.cwd(), 'data', 'contact-messages.json');
const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.CF_PAGES);

function readLocal(): ContactMessage[] {
  try {
    return JSON.parse(fs.readFileSync(contactsPath, 'utf8') || '[]') as ContactMessage[];
  } catch {
    return [];
  }
}

function writeLocal(items: ContactMessage[]) {
  try {
    fs.mkdirSync(path.dirname(contactsPath), { recursive: true });
    fs.writeFileSync(contactsPath, JSON.stringify(items, null, 2));
  } catch {
    // Ignore filesystem write errors in read-only hosted environments
  }
}

export async function saveContactMessage(input: Omit<ContactMessage, 'receivedAt'>): Promise<ContactMessage> {
  const item: ContactMessage = { ...input, receivedAt: new Date().toISOString() };

  const supabase = getSupabase();
  if (supabase) {
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

  if (isHosted) throw supabaseStorageError();
  const items = readLocal();
  items.unshift(item);
  writeLocal(items);
  return item;
}
