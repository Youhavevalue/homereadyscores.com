/* eslint-disable react-refresh/only-export-components -- hook colocated with provider */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = 'info') => {
    setToast({ message, variant, id: Date.now() });
    setTimeout(() => setToast(null), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          className={`admin-toast fixed bottom-6 left-1/2 z-[200] max-w-md -translate-x-1/2 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.variant === 'error'
              ? 'bg-red-600 text-white'
              : toast.variant === 'success'
                ? 'bg-emerald-700 text-white'
                : 'bg-[#002D5B] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
