// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';

// export function withPageAuth(WrappedComponent) {
//   return function WithPageAuth(props) {
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(true);
//     const supabase = createClientComponentClient();

//     useEffect(() => {
//       async function checkAuth() {
//         try {
//           const { data: { session } } = await supabase.auth.getSession();
          
//           if (!session) {
//             router.replace('/authentication/login');
//             return;
//           }
          
//           setIsLoading(false);
//         } catch (error) {
//           console.error('Auth error:', error);
//           router.replace('/authentication/login');
//         }
//       }

//       checkAuth();
//     }, [router, supabase]);

//     if (isLoading) {
//       return <div>Loading...</div>;
//     }

//     return <WrappedComponent {...props} />;
//   };
// }

// export async function getServerSideProps(context) {
//   return {
//     props: {}
//   };
// }
