import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For client-side usage
export const supabase = createClientComponentClient();
