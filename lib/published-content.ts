import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getSupabase, supabaseStorageError } from './supabase';

export type PublishedContent = {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  topic: string;
  type: string;
  abstract: string;
  body: string;
  tags: string[];
  references: string[];
  collection: 'paper' | 'article';
  sourceSubmissionId: string;
};

const publishedPath = path.join(process.cwd(), 'data', 'published-submissions.json');
const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.CF_PAGES);

function readLocal(): PublishedContent[] {
  try {
    return JSON.parse(fs.readFileSync(publishedPath, 'utf8') || '[]') as PublishedContent[];
  } catch {
    return [];
  }
}

function writeLocal(items: PublishedContent[]) {
  try {
    fs.mkdirSync(path.dirname(publishedPath), { recursive: true });
    fs.writeFileSync(publishedPath, JSON.stringify(items, null, 2));
  } catch {
    // Ignore filesystem write errors in read-only hosted environments
  }
}

function mapRowToPublished(row: any): PublishedContent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    date: row.date,
    topic: row.topic,
    type: row.type,
    abstract: row.abstract,
    body: row.body,
    tags: Array.isArray(row.tags) ? row.tags : [],
    references: Array.isArray(row.references) ? row.references : [],
    collection: row.collection as 'paper' | 'article',
    sourceSubmissionId: row.source_submission_id,
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
}

export async function createPublishedContent(
  input: Omit<PublishedContent, 'id' | 'slug' | 'date'>
): Promise<PublishedContent> {
  const base = slugify(input.title) || 'hum-medicals-submission';
  const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
  const item: PublishedContent = {
    ...input,
    id: crypto.randomUUID(),
    slug,
    date: new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date()),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('published_content').insert({
      id: item.id,
      slug: item.slug,
      title: item.title,
      author: item.author,
      date: item.date,
      topic: item.topic,
      type: item.type,
      abstract: item.abstract,
      body: item.body,
      tags: item.tags,
      references: item.references,
      collection: item.collection,
      source_submission_id: item.sourceSubmissionId,
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

export async function getPublishedContent(collection?: 'paper' | 'article'): Promise<PublishedContent[]> {
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase
      .from('published_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (collection) {
      query = query.eq('collection', collection);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(mapRowToPublished);
  }

  if (isHosted) throw supabaseStorageError();
  return readLocal().filter((item) => !collection || item.collection === collection);
}

export async function getPublishedBySlug(slug: string): Promise<PublishedContent | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('published_content')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRowToPublished(data) : null;
  }

  if (isHosted) throw supabaseStorageError();
  return readLocal().find((item) => item.slug === slug) || null;
}
