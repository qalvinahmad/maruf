// import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// export const withPageAuth = (options = {}) => {
//   return async (context) => {
//     const supabase = createServerSupabaseClient(context);
    
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) {
//         return {
//           redirect: {
//             destination: '/authentication/login',
//             permanent: false,
//           },
//         };
//       }

//       const response = {
//         props: {
//           initialSession: session,
//           user: session.user,
//         },
//       };

//       if (options.getServerSideProps) {
//         const customProps = await options.getServerSideProps(context, session);
//         response.props = {
//           ...response.props,
//           ...customProps.props,
//         };
//       }

//       return response;
//     } catch (error) {
//       return {
//         redirect: {
//           destination: '/authentication/login',
//           permanent: false,
//         },
//       };
//     }
//   };
// };

// // Wrapper for pages that don't require auth
// export const withPublicAccess = async () => {
//   return {
//     props: {},
//   };
// };

// // Helper for API routes
// export const checkAuth = async (req, res) => {
//   const supabase = createServerSupabaseClient({ req, res });

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (!session) {
//     return {
//       error: 'Not authenticated',
//       status: 401,
//     };
//   }

//   return {
//     session,
//     user: session.user,
//     supabase,
//   };
// };
