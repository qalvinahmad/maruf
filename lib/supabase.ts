import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For client-side usage
export const createClient = (supabaseUrl: string | undefined, supabaseAnonKey: string | undefined, p0: { auth: { persistSession: boolean; autoRefreshToken: boolean; detectSessionInUrl: boolean; storage: { getItem: (key: any) => any; setItem: (key: any, value: any) => void; removeItem: (key: any) => void; }; }; }) => {
  return createClientComponentClient();
};

// For direct usage (non-component contexts)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        return JSON.parse(localStorage.getItem(key) || 'null');
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
      },
    },
  },
});
