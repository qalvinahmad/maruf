import { IconBell, IconCalendar, IconLogout, IconTrophy } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { FiAward } from 'react-icons/fi';

const HeaderTeacher = ({ userName = '', teacherProfile }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all teacher-related localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    localStorage.removeItem('teacherInstitution');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Clear all other possible auth keys
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('authToken');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Redirect to teacher login page
    window.location.href = '/authentication/teacher/loginTeacher';
  };

  // Safe display name with fallback
  const displayName = userName || 'Teacher';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              {displayName}
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Teacher</span>
            </h2>
            <div className="flex items-center text-xs text-gray-500 gap-3">
              <span>{teacherProfile?.is_verified ? 'Terverifikasi • ' : ''}{teacherProfile?.status || 'Pending'}</span>
              <span className="flex items-center gap-1 text-purple-600">
                <IconCalendar size={12} />
                <span>{teacherProfile?.teaching_experience || 'Belum ada'}</span>
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <IconTrophy size={12} />
                <span>{teacherProfile?.specialization || 'Belum ada'}</span>
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <FiAward size={12} />
                <span>{teacherProfile?.institution || 'Belum ada'}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <IconBell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <IconLogout size={16} />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderTeacher;
