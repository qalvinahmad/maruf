import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function DebugAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      const state = {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        isTeacher: localStorage.getItem('isTeacher'),
        teacherEmail: localStorage.getItem('teacherEmail'),
        teacherName: localStorage.getItem('teacherName'),
        teacherId: localStorage.getItem('teacherId'),
        userId: localStorage.getItem('userId'),
        teacherInstitution: localStorage.getItem('teacherInstitution'),
      };
      setAuthState(state);
    };
    
    checkAuth();
  }, []);

  const setMockAuth = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isTeacher', 'true');
    localStorage.setItem('teacherEmail', 'test@teacher.com');
    localStorage.setItem('teacherName', 'Test Teacher');
    localStorage.setItem('teacherId', '123');
    localStorage.setItem('userId', '456');
    localStorage.setItem('teacherInstitution', 'Test School');
    window.location.reload();
  };

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const testLoginPage = () => {
    router.push('/authentication/teacher/loginTeacher');
  };

  const testDashboard = () => {
    router.push('/dashboard/teacher/DashboardStats');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Authentication Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Current Auth State</h2>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(authState).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value || 'null'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={setMockAuth}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                ✅ Set Mock Teacher Auth
              </button>
              
              <button
                onClick={clearAuth}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ Clear All Auth
              </button>
              
              <button
                onClick={testLoginPage}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                🔐 Test Login Page
              </button>
              
              <button
                onClick={testDashboard}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                📊 Test Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Expected Flow */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-bold mb-4">Expected Flow</h2>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>1. No Auth:</strong> Both pages should redirect to login
            </div>
            <div className="p-3 bg-green-50 rounded">
              <strong>2. With Auth:</strong> Login should redirect to dashboard, dashboard should load normally
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <strong>3. Test Steps:</strong>
              <ol className="list-decimal list-inside ml-4 mt-2">
                <li>Clear auth → Test both pages (should go to login)</li>
                <li>Set mock auth → Test both pages (should go to/stay on dashboard)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
