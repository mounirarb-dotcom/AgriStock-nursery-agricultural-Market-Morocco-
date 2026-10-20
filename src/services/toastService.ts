export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners: Set<ToastListener> = new Set();

export const toastService = {
  subscribe(listener: ToastListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  show(type: ToastType, message: string, title?: string, duration: number = 4000): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: ToastMessage = { id, type, title, message, duration };

    listeners.forEach((listener) => {
      try {
        listener(toast);
      } catch (e) {
        console.error('Toast listener error:', e);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: toast }));
    }
  },

  success(message: string, title?: string, duration?: number): void {
    this.show('success', message, title || 'Succès', duration);
  },

  error(message: string, title?: string, duration: number = 5000): void {
    this.show('error', message, title || 'Attention', duration);
  },

  warning(message: string, title?: string, duration?: number): void {
    this.show('warning', message, title || 'Alerte', duration);
  },

  info(message: string, title?: string, duration?: number): void {
    this.show('info', message, title || 'Information', duration);
  },
};
