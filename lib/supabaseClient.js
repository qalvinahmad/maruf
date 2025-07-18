import { createClient } from '@supabase/supabase-js';

// Use fallback values during build time, real values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key';

// FIXED: Only validate during runtime, not build time
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-ref')) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not properly configured');
    }
    throw new Error('Supabase URL configuration error');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_supabase_anon_key_here')) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured');
    }
    throw new Error('Supabase Anon Key configuration error');
  }
}

// FIXED: Validate URL format only in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!url.hostname.includes('supabase.co')) {
      console.warn('⚠️ URL does not appear to be a Supabase URL');
    }
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', process.env.NEXT_PUBLIC_SUPABASE_URL);
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
