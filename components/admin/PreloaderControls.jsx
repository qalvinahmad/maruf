import { useRouter } from 'next/router';
import { useState } from 'react';

const PreloaderControls = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    setShowConfirm(false);
    // Redirect ke halaman landing untuk memicu preloader
    router.push('/');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Preloader Controls</h3>
      <p className="text-sm text-gray-600 mb-4">
        Preloader akan tampil setiap kali halaman landing (/) dimuat ulang atau dikunjungi.
      </p>
      
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Lihat Preloader
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-amber-600 font-medium">
            Akan redirect ke halaman landing untuk menampilkan preloader.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Ya, Lihat
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Info:</strong> Preloader tampil setiap kali halaman landing dimuat</p>
        <p><strong>Halaman saat ini:</strong> {router.pathname}</p>
      </div>
    </div>
  );
};

export default PreloaderControls;
