export const AuthTabs = ({ currentPage }) => {
  const navigate = (path) => {
    window.location.replace(`/authentication/${path}`);
  };

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl flex shadow-lg">
        <button
          onClick={() => navigate('login')}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 'login'
              ? 'bg-white text-[#00acee] font-extrabold'
              : 'text-black hover:bg-white/10'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => navigate('register')}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 'register'
              ? 'bg-white text-[#00acee] font-extrabold'
              : 'text-black hover:bg-white/10'
          }`}
        >
          Register
        </button>
      </div>
    </div>
  );
};
