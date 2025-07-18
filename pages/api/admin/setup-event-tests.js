// pages/api/admin/setup-event-tests.js
import { createClient } from '@supabase/supabase-js';

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Setting up pronunciation tests for all events...');
    
    // Use admin client for RLS bypass
    const db = supabaseAdmin;
    
    // First, get all events that don't have pronunciation tests
    const { data: events, error: eventsError } = await db
      .from('events')
      .select(`
        id, 
        title,
        event_pronunciation_tests(id)
      `);
    
    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return res.status(500).json({ error: 'Failed to fetch events', details: eventsError });
    }
    
    console.log(`📋 Found ${events.length} events total`);
    
    const results = [];
    
    // Process each event
    for (const event of events) {
      const hasTests = event.event_pronunciation_tests.length > 0;
      console.log(`\n📝 Processing: "${event.title}" - ${hasTests ? 'Has tests' : 'NO TESTS'}`);
      
      if (hasTests) {
        console.log('✅ Already has tests, skipping...');
        results.push({
          title: event.title,
          status: 'skipped',
          reason: 'Already has tests'
        });
        continue;
      }
      
      // Add pronunciation tests based on event title
      let testsToAdd = [];
      
      if (event.title.toLowerCase().includes('isra') && event.title.toLowerCase().includes('miraj')) {
        console.log('🌙 Adding Isra Mi\'raj themed tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا',
            transliteration: 'Subhanallazi asra bi\'abdihi lailan',
            translation: 'Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam',
            expected_sound: 'subhana allazi asra bi\'abdihi lailan',
            difficulty: 'Menengah'
          },
          {
            test_order: 2,
            arabic_text: 'مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى',
            transliteration: 'minal masjidil harami ilal masjidil aqsha',
            translation: 'dari Masjidil Haram ke Masjidil Aqsha',
            expected_sound: 'mina al-masjidi al-harami ila al-masjidi al-aqsa',
            difficulty: 'Sulit'
          },
          {
            test_order: 3,
            arabic_text: 'الَّذِي بَارَكْنَا حَوْلَهُ',
            transliteration: 'allazi barakna hawlahu',
            translation: 'yang telah Kami berkahi sekelilingnya',
            expected_sound: 'allazi barakna hawlahu',
            difficulty: 'Mudah'
          }
        ];
      }
      else if (event.title.toLowerCase().includes('nisfu') && event.title.toLowerCase().includes('sya\'ban')) {
        console.log('🌙 Adding Nisfu Sya\'ban themed tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ',
            transliteration: 'wa minal layli fatahajjad bihi nafilatan laka',
            translation: 'Dan pada sebahagian malam hari bersembahyang tahajudlah kamu sebagai suatu ibadah tambahan bagimu',
            expected_sound: 'wa mina al-layli fa-tahajjad bihi nafilatan laka',
            difficulty: 'Sulit'
          },
          {
            test_order: 2,
            arabic_text: 'عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا',
            transliteration: 'asa an yab\'athaka rabbuka maqaman mahmuda',
            translation: 'mudah-mudahan Tuhan-mu mengangkat kamu ke tempat yang terpuji',
            expected_sound: 'asa an yab\'athaka rabbuka maqaman mahmuda',
            difficulty: 'Menengah'
          }
        ];
      }
      else if (event.title.toLowerCase().includes('ramadan')) {
        console.log('🌙 Adding Ramadan themed tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ',
            transliteration: 'ya ayyuhal lazina amanu kutiba \'alaykumus shiyam',
            translation: 'Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa',
            expected_sound: 'ya ayyuha allazina amanu kutiba \'alaykumu as-siyamu',
            difficulty: 'Menengah'
          },
          {
            test_order: 2,
            arabic_text: 'لَعَلَّكُمْ تَتَّقُونَ',
            transliteration: 'la\'allakum tattaqun',
            translation: 'agar kamu bertakwa',
            expected_sound: 'la\'allakum tattaquna',
            difficulty: 'Mudah'
          },
          {
            test_order: 3,
            arabic_text: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ',
            transliteration: 'shahru ramadhanal lazi unzila fihil qur\'an',
            translation: 'Bulan Ramadhan, bulan yang di dalamnya diturunkan Al Quran',
            expected_sound: 'shahru ramadhana allazi unzila fihi al-qur\'anu',
            difficulty: 'Menengah'
          }
        ];
      }
      else if (event.title.toLowerCase().includes('dzulhijjah')) {
        console.log('🕋 Adding Dzulhijjah themed tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ',
            transliteration: 'wa azzin fin naasi bil hajj',
            translation: 'Dan berserulah kepada manusia untuk mengerjakan haji',
            expected_sound: 'wa azzin fi an-nasi bi-al-hajji',
            difficulty: 'Menengah'
          },
          {
            test_order: 2,
            arabic_text: 'يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ',
            transliteration: 'ya\'tuka rijalan wa \'ala kulli dhamirin',
            translation: 'niscaya mereka akan datang kepadamu dengan berjalan kaki, dan mengendarai unta yang kurus',
            expected_sound: 'ya\'tuka rijalan wa \'ala kulli dhamirin',
            difficulty: 'Sulit'
          }
        ];
      }
      else if (event.title.toLowerCase().includes('kompetisi') && event.title.toLowerCase().includes('membaca')) {
        console.log('🏆 Adding Quran Competition themed tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
            transliteration: 'wa rattilil qur\'ana tartiila',
            translation: 'dan bacalah Al Quran itu dengan perlahan-lahan',
            expected_sound: 'wa rattili al-qur\'ana tartiilan',
            difficulty: 'Mudah'
          },
          {
            test_order: 2,
            arabic_text: 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَتْلُونَهُ حَقَّ تِلَاوَتِهِ',
            transliteration: 'allazina ataynahumul kitaba yatlunahu haqqa tilawatihi',
            translation: 'Orang-orang yang telah Kami berikan Al Kitab kepadanya, mereka membacanya dengan bacaan yang sebenarnya',
            expected_sound: 'allazina ataynahumu al-kitaba yatlunahu haqqa tilawatihi',
            difficulty: 'Sulit'
          },
          {
            test_order: 3,
            arabic_text: 'أُولَٰئِكَ يُؤْمِنُونَ بِهِ',
            transliteration: 'ula\'ika yu\'minuna bihi',
            translation: 'mereka itu beriman kepadanya',
            expected_sound: 'ula\'ika yu\'minuna bihi',
            difficulty: 'Mudah'
          }
        ];
      }
      else {
        console.log('📖 Adding general Al-Quran tests...');
        testsToAdd = [
          {
            test_order: 1,
            arabic_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            transliteration: 'Bismillahir-Rahmanir-Rahim',
            translation: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang',
            expected_sound: 'bismillahi ar-rahmani ar-rahimi',
            difficulty: 'Mudah'
          },
          {
            test_order: 2,
            arabic_text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            transliteration: 'Alhamdulillahi Rabbil-Alameen',
            translation: 'Segala puji bagi Allah, Tuhan seluruh alam',
            expected_sound: 'alhamdu lillahi rabbi al-alamina',
            difficulty: 'Mudah'
          },
          {
            test_order: 3,
            arabic_text: 'الرَّحْمَٰنِ الرَّحِيمِ',
            transliteration: 'Ar-Rahmanir-Rahim',
            translation: 'Yang Maha Pengasih lagi Maha Penyayang',
            expected_sound: 'ar-rahmani ar-rahimi',
            difficulty: 'Mudah'
          }
        ];
      }
      
      if (testsToAdd.length > 0) {
        // Add event_id to each test
        const testsWithEventId = testsToAdd.map(test => ({
          ...test,
          event_id: event.id
        }));
        
        // Insert pronunciation tests
        const { error: insertError } = await db
          .from('event_pronunciation_tests')
          .insert(testsWithEventId);
        
        if (insertError) {
          console.error(`❌ Error inserting tests for "${event.title}":`, insertError);
          results.push({
            title: event.title,
            status: 'error',
            error: insertError.message
          });
        } else {
          console.log(`✅ Added ${testsToAdd.length} tests for "${event.title}"`);
          
          // Add reward
          const { error: rewardError } = await db
            .from('event_rewards')
            .insert({
              event_id: event.id,
              min_score: 70,
              xp_reward: 50 + (testsToAdd.length * 5),
              points_reward: 30 + (testsToAdd.length * 3),
              badge_reward: `Master ${event.title.split(' ')[0]}`
            });
          
          results.push({
            title: event.title,
            status: 'success',
            testsAdded: testsToAdd.length,
            rewardAdded: !rewardError
          });
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Event tests setup completed',
      results: results
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
