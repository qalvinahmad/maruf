import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TeacherRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to teacher login page
    router.replace('/authentication/teacher/loginTeacher');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
