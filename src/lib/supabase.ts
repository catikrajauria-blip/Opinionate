import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables/secrets.");
  }

  // Ensure URL is fixed if only the project ID was provided or if the full REST URL was pasted
  let finalUrl = supabaseUrl.trim();
  
  // If it's just the reference ID (e.g., hdkbw...)
  if (!finalUrl.includes('.')) {
    finalUrl = `https://${finalUrl}.supabase.co`;
  }
  
  // Ensure it starts with https://
  if (!finalUrl.startsWith('http')) {
    finalUrl = `https://${finalUrl}`;
  }

  // Strip common subpaths if someone pasted the REST URL directly
  finalUrl = finalUrl.replace(/\/rest\/v1\/?$/, '');
  finalUrl = finalUrl.replace(/\/$/, ''); // Remove trailing slash

  supabaseInstance = createClient(finalUrl, supabaseAnonKey);
  return supabaseInstance;
};

// For backward compatibility with existing imports, we can use a Proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop, receiver) => {
    const client = getSupabase();
    return Reflect.get(client, prop, receiver);
  }
});
