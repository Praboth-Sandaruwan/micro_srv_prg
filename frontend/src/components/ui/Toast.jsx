// src/components/ui/Toast.jsx
import toast, { Toaster } from 'react-hot-toast';

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: { 
      background: '#10B981', 
      color: 'white' 
    }
  });
};

// Error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: { 
      background: '#EF4444', 
      color: 'white' 
    }
  });
};

// Info toast
export const showInfoToast = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: '📌',
    style: { 
      background: '#3B82F6', 
      color: 'white' 
    }
  });
};

// Promise toast for async operations
export const showLoadingToast = (promise, { loading, success, error }) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  }, {
    position: 'top-right',
    duration: 5000
  });
};

// Export an object with methods for easier access
export const showToast = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  loading: showLoadingToast
};

// Toast component for rendering the toast container
export const Toast = () => {
  return <Toaster />;
};