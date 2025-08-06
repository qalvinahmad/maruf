import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import { useAuth } from '../../../../context/AuthContext';
import ProjectRating from './ProjectRating';

const RatingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin access
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProjectRating />
        </div>
      </div>
    </Layout>
  );
};

export default RatingPage;
