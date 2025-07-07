// import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// export const withAuth = async (context) => {
//   try {
//     const supabase = createServerSupabaseClient(context);
    
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.getSession();

//     if (error || !session) {
//       return {
//         redirect: {
//           destination: '/authentication/login',
//           permanent: false,
//         },
//       };
//     }

//     // Get user profile
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', session.user.id)
//       .single();

//     return {
//       props: {
//         user: session.user,
//         profile: profile || null,
//         initialSession: session,
//       },
//     };
//   } catch (error) {
//     console.error('Auth error:', error);
//     return {
//       redirect: {
//         destination: '/authentication/login',
//         permanent: false,
//       },
//     };
//   }
// };
