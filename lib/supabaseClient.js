import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('Key:', supabaseAnonKey ? 'Found' : 'Missing')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item to localStorage:', error);
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from localStorage:', error);
        }
      },
    },
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Connection error:', err);
    return false;
  }
};
