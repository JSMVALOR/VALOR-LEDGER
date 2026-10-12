# Supabase Schema Setup for VALOR LEDGER

Run this SQL snippet in your Supabase SQL Editor (https://supabase.com/dashboard) to initialize cloud persistence:

```sql
-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    "contactPerson" TEXT,
    phone TEXT,
    city TEXT,
    industry TEXT,
    stage TEXT DEFAULT 'New',
    priority TEXT DEFAULT 'Medium',
    value NUMERIC DEFAULT 10000,
    "nextFollowUp" TEXT,
    "createdAt" BIGINT,
    email TEXT,
    website TEXT,
    "assignedTo" TEXT DEFAULT 'swaroop',
    notes TEXT,
    "lastContactedAt" BIGINT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for team (or configure your authenticated policies)
CREATE POLICY "Allow public all access" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### Environment Configuration:
Add these to your `.env.local` or Vercel Environment Variables:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
