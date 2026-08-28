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

-- 5. Seed Initial Workspace Users
INSERT INTO public.users (name)
VALUES ('Alex'), ('Sam'), ('Jordan')
ON CONFLICT (name) DO NOTHING;

-- 6. Enable Row Level Security (RLS) and grant public read/write access for demo/workspace team
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public all columns" ON public.columns FOR ALL USING (true);
CREATE POLICY "Allow public all cards" ON public.cards FOR ALL USING (true);

-- 7. Enable Realtime Replication for instant multi-user syncing!
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
