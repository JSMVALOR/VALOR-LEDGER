import { createClient } from '@supabase/supabase-js';

// Production Supabase project credentials for VALOR LEDGER
const DEFAULT_SUPABASE_URL = 'https://byobpusywhcwhmctgryv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_wVbeegDgsGiG7l8idQy5Ow__Bw9o_9N';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
