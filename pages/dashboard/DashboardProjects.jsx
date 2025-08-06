import { useRouter } from 'next/router';
import { useEffect } from 'react';

// This component will redirect to the actual admin DashboardProjects page
export default function DashboardProjects() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the correct admin projects page
    router.replace('/dashboard/admin/project/DashboardProjects');
  }, [router]);
  
  // Return a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Redirecting...</h2>
        <p className="text-gray-500">Taking you to the projects dashboard</p>
      </div>
    </div>
  );
}
