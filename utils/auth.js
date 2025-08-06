// import { supabase } from '../lib/supabaseClient';

// export const withAuthServerSideProps = async (context) => {
//   try {
//     const { data: { session } } = await supabase.auth.getSession();

//     if (!session) {
//       return {
//         redirect: {
//           destination: '/authentication/login',
//           permanent: false
//         }
//       };
//     }

//     return {
//       props: {
//         initialSession: session,
//         user: session.user
//       }
//     };
//   } catch (error) {
//     return {
//       redirect: {
//         destination: '/authentication/login',
//         permanent: false
//       }
//     };
//   }
// };

// export const withPublicServerSideProps = async () => {
//   return {
//     props: {}
//   };
// };
