import { useEffect, useState } from 'react';

const Preloader = ({ isLoading, setIsLoading }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const totalTime = 2000; // 2 detik
    const intervalTime = 20; // 20ms
    const steps = totalTime / intervalTime;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newPercentage = Math.min(100, Math.round((currentStep / steps) * 100));
      setPercentage(newPercentage);
      
      if (newPercentage >= 100) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [setIsLoading]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      {/* Google Fonts - Poppins */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      {isLoading && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00acee]"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="bg-white/30 backdrop-blur-md p-8 rounded-lg flex flex-col items-center justify-center">

                      
          <img src="/loading.gif" alt="Loading" className="mb-4 w-16 h-16" />
         
            {/* Circular Progress Bar */}
            <div className="relative mb-6">
              <svg 
                className="w-32 h-32 transform -rotate-90" 
                viewBox="0 0 100 100"
              >
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="white"
                  strokeWidth="6"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              {/* Percentage Text in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {percentage}%
                </span>
              </div>
            </div>

            <p className="text-white font-poppins text-center">
              ...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Preloader;