import React, { useState, useEffect } from 'react';
import { toastService, ToastMessage } from '../services/toastService';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const AppToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((newToast) => {
      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, newToast.duration);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-3 fade-in duration-200 ${
              isSuccess
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50'
                : isError
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/50'
                : isWarning
                ? 'bg-amber-950/95 text-amber-100 border-amber-500/50'
                : 'bg-stone-900/95 text-stone-100 border-stone-700/80'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-sky-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-90">
                  {toast.title}
                </div>
              )}
              <div className="text-xs font-medium leading-relaxed break-words">
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
