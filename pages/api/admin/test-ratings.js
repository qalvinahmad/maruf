import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing rating queries...');

    // Test 1: Basic rating query
    console.log('Test 1: Basic rating query');
    const { data: basicData, error: basicError } = await supabase
      .from('rating')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Basic query result:', {
      count: basicData?.length || 0,
      error: basicError?.message || null,
      sample: basicData?.[0] || null
    });

    // Test 2: Rating with users join
    console.log('Test 2: Rating with users join');
    const { data: joinData, error: joinError } = await supabase
      .from('rating')
      .select(`
        *,
        users!rating_user_id_fkey (
          id,
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    console.log('Join query result:', {
      count: joinData?.length || 0,
      error: joinError?.message || null,
      sample: joinData?.[0] || null
    });

    // Test 3: Check users table
    console.log('Test 3: Check users table');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);

    console.log('Users query result:', {
      count: usersData?.length || 0,
      error: usersError?.message || null,
      sample: usersData?.[0] || null
    });

    // Test 4: Manual join
    console.log('Test 4: Manual join with specific user IDs');
    if (basicData && basicData.length > 0) {
      const userIds = [...new Set(basicData.map(r => r.user_id))];
      console.log('User IDs found in ratings:', userIds);

      const { data: specificUsers, error: specificUsersError } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds);

      console.log('Specific users result:', {
        count: specificUsers?.length || 0,
        error: specificUsersError?.message || null,
        users: specificUsers || []
      });
    }

    return res.status(200).json({
      success: true,
      tests: {
        basicRatings: {
          count: basicData?.length || 0,
          error: basicError?.message || null,
          data: basicData || []
        },
        joinRatings: {
          count: joinData?.length || 0,
          error: joinError?.message || null,
          data: joinData || []
        },
        users: {
          count: usersData?.length || 0,
          error: usersError?.message || null,
          data: usersData || []
        }
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
