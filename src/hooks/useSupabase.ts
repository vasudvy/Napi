import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

export function useSupabase() {
  const supabase = useMemo(() => createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  ), []);

  return { supabase };
}