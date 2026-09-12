import crypto from 'crypto';
import { getSupabase, supabaseStorageError } from './supabase';

export type EditorialStatus = 'submitted' | 'reviewed' | 'approved' | 'changes_requested' | 'rejected';
export type SimilarityMatch = {
  title: string;
  source: 'Hum Medicals library' | 'Approved community submission';
  score: number;
};
export type ReviewReport = {
  reviewedAt: string;
  model: string;
  recommendation: 'approve' | 'changes' | 'reject';
  summary: string;
  strengths: string[];
  concerns: string[];
  safetyEthics: string[];
  suggestedTopic: string;
  suggestedCollection: 'paper' | 'article';
  similarityScore: number;
  similarityMatches: SimilarityMatch[];
};
export type Submission = {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  type: string;
  topic: string;
  abstract: string;
  manuscript: string;
  status: EditorialStatus;
  createdAt: string;
  review?: ReviewReport;
  publishedSlug?: string;
  publishedCollection?: 'paper' | 'article';
  adminNote?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    title: row.title,
    type: row.type,
    topic: row.topic,
    abstract: row.abstract,
    manuscript: row.manuscript,
    status: row.status as EditorialStatus,
    createdAt: row.created_at,
    review: row.review as ReviewReport | undefined,
    publishedSlug: row.published_slug || undefined,
    publishedCollection: (row.published_collection as 'paper' | 'article') || undefined,
    adminNote: row.admin_note || undefined,
  };
}

export function statusLabel(status: EditorialStatus | string) {
  return (
    ({
      submitted: 'Submitted — Under Review',
      reviewed: 'AI Review Complete',
      approved: 'Approved — Published',
      changes_requested: 'Changes Requested',
      rejected: 'Not Approved',
    } as Record<string, string>)[status] || 'Submitted — Under Review'
  );
}

export async function createSubmission(input: Omit<Submission, 'id' | 'status' | 'createdAt'>): Promise<Submission> {
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase.from('submissions').insert({
    id: submission.id,
    author_id: submission.authorId,
    author_name: submission.authorName,
    author_email: submission.authorEmail,
    title: submission.title,
    type: submission.type,
    topic: submission.topic,
    abstract: submission.abstract,
    manuscript: submission.manuscript,
    status: submission.status,
    created_at: submission.createdAt,
  });
  if (error) throw new Error(error.message);
  return submission;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data, error } = await supabase.from('submissions').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRowToSubmission(data) : null;
}

export async function getSubmissionsForAuthor(authorId: string): Promise<Submission[]> {
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data || []).map(mapRowToSubmission);
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data || []).map(mapRowToSubmission);
}

export async function updateSubmission(
  id: string,
  changes: Partial<Omit<Submission, 'id' | 'authorId' | 'authorName' | 'authorEmail' | 'createdAt'>>
): Promise<Submission> {
  const current = await getSubmission(id);
  if (!current) throw new Error('Submission not found.');
  const updated: Submission = { ...current, ...changes };

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { error } = await supabase
    .from('submissions')
    .update({
      title: updated.title,
      type: updated.type,
      topic: updated.topic,
      abstract: updated.abstract,
      manuscript: updated.manuscript,
      status: updated.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      review: (updated.review as any) || null,
      published_slug: updated.publishedSlug || null,
      published_collection: updated.publishedCollection || null,
      admin_note: updated.adminNote || null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return updated;
}

