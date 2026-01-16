import React from 'react';

/**
 * Toast Notification Component
 */
const Toast = ({ id, message, type, onRemove }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const baseClasses =
    'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in text-white';

  const typeClasses = {
    success: 'bg-gradient-to-r from-green-600 to-emerald-600',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    info: 'bg-gradient-to-r from-blue-600 to-blue-700',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

/**
 * Toast Container Component
 */
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={onRemove}
        />
      ))}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Toast;
