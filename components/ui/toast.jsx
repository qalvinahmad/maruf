import { Toaster, toast } from 'sonner';

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '8px',
          fontSize: '14px',
          padding: '16px',
          marginBottom: '8px',
        },
        className: 'font-poppins',
        success: {
          style: {
            background: '#22c55e',
            color: 'white',
            border: 'none',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
          },
        },
        warning: {
          style: {
            background: '#f97316',
            color: 'white',
            border: 'none',
          },
        },
        default: {
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        },
      }}
    />
  );
};

// Helper functions to trigger toasts
export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
    });
  },
  warning: (message) => {
    toast.warning(message, {
      duration: 4000,
    });
  },
  info: (message) => {
    toast(message, {
      duration: 3000,
    });
  },
};

// Add new toast variant for modal context
export const showModalToast = {
  success: (message) => {
    toast.success(message, {
      duration: 2000,
      position: 'top-center', // Better position for modals
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  },
};

// Usage example:
/*
import { Toast, showToast } from '@/components/ui/toast';

// In your component:
return (
  <>
    <Toast /> // Add this once at the root level
    
    // Trigger toasts:
    showToast.success('Berhasil menyimpan data!');
    showToast.error('Terjadi kesalahan!');
    showToast.warning('Perhatian!');
    showToast.info('Informasi baru');
  </>
);
*/
