import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// FIXED: Better validation without console noise in production
if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not properly configured in .env.local');
  }
  throw new Error('Supabase URL configuration error');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured in .env.local');
  }
  throw new Error('Supabase Anon Key configuration error');
}

// FIXED: Validate URL format only in development
if (process.env.NODE_ENV === 'development') {
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co')) {
      console.warn('⚠️ URL does not appear to be a Supabase URL');
    }
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // FIXED: Disable to prevent SSR issues
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'nextjs-app'
    }
  },
  // FIXED: Add realtime options to reduce connection issues
  realtime: {
    params: {
      eventsPerSecond: 2 // Limit events to reduce noise
    }
  }
});

// FIXED: Only log in development and suppress in production
if (process.env.NODE_ENV === 'development' && !process.env.SUPPRESS_REDIS_WARNINGS) {
  console.log('✅ Supabase client initialized successfully');
  console.log('📍 Project URL:', supabaseUrl);
}

