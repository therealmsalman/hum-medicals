-- ==============================================================================
-- Hum Medicals — Supabase PostgreSQL Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  session_version INT NOT NULL DEFAULT 1,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Auth Actions Table (One-time password reset & verification tokens)
CREATE TABLE IF NOT EXISTS public.auth_actions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email-verification' | 'password-reset'
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Submissions Table (Author manuscripts)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  topic TEXT NOT NULL,
  abstract TEXT NOT NULL,
  manuscript TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'reviewed' | 'approved' | 'changes_requested' | 'rejected'
  review JSONB,
  published_slug TEXT,
  published_collection TEXT, -- 'paper' | 'article'
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Published Content Table (Approved journal publications & articles)
CREATE TABLE IF NOT EXISTS public.published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL,
  abstract TEXT NOT NULL,
  body TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  "references" JSONB NOT NULL DEFAULT '[]'::jsonb,
  collection TEXT NOT NULL DEFAULT 'article', -- 'paper' | 'article'
  source_submission_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Subscribers Table (Newsletter recipients)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Contact Messages Table (Direct inquiries)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Rate Limits Table (Lightweight distributed throttling)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  reset_at BIGINT NOT NULL
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON public.submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_content_slug ON public.published_content(slug);
CREATE INDEX IF NOT EXISTS idx_published_content_collection ON public.published_content(collection);
CREATE INDEX IF NOT EXISTS idx_published_content_created_at ON public.published_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_received_at ON public.contact_messages(received_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- Enable RLS and grant service_role full access, with public read on approved content
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service_role key full unrestricted access to all tables
CREATE POLICY "Service role has full access to users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to sessions" ON public.sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to auth_actions" ON public.auth_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to submissions" ON public.submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to published_content" ON public.published_content FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to subscribers" ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to contact_messages" ON public.contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to rate_limits" ON public.rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow public read access to published content
CREATE POLICY "Public read access to published content" ON public.published_content FOR SELECT TO anon, authenticated USING (true);
