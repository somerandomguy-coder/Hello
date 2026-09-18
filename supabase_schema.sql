-- Hello Supabase Schema & Realtime Setup
-- Copy and paste this into Supabase SQL Editor to set up your backend DB!

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Columns Table
CREATE TABLE IF NOT EXISTS public.columns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  column_id TEXT NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_to TEXT[] DEFAULT '{}',
  position INT NOT NULL DEFAULT 0,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seed Default Columns if empty
INSERT INTO public.columns (id, name, position)
VALUES 
  ('col-backlog', 'Backlog', 0),
  ('col-ongoing', 'On-going', 1),
  ('col-done', 'Done', 2)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS) and grant public read/write access for workspace team
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if re-running query
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete users" ON public.users;
DROP POLICY IF EXISTS "Allow public all users" ON public.users;

DROP POLICY IF EXISTS "Allow public all columns" ON public.columns;
DROP POLICY IF EXISTS "Allow public all cards" ON public.cards;

-- Create unified RLS policies
CREATE POLICY "Allow public all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all columns" ON public.columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all cards" ON public.cards FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime Replication for instant multi-user syncing (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'columns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
  END IF;
END $$;
