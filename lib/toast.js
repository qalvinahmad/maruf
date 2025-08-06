// Toast utility for consistent usage across the app
import { showToast } from '../components/ui/toast';

// Simple wrapper to maintain backward compatibility
export const toast = {
  success: (message) => showToast.success(message),
  error: (message) => showToast.error(message),
  warning: (message) => showToast.warning(message),
  info: (message) => showToast.info(message)
};

// Alternative shorter function exports
export const toastSuccess = (message) => showToast.success(message);
export const toastError = (message) => showToast.error(message);
export const toastWarning = (message) => showToast.warning(message);
export const toastInfo = (message) => showToast.info(message);

// For backward compatibility with the old signature
export const notify = (message, type = 'info') => {
  switch (type) {
    case 'success':
      showToast.success(message);
      break;
    case 'error':
      showToast.error(message);
      break;
    case 'warning':
      showToast.warning(message);
      break;
    default:
      showToast.info(message);
  }
};

export default toast;
