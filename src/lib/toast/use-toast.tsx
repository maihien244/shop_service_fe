import { toast } from '#/components/ui/toast';
import { Root as AlertToast } from '@/lib/toast/ui/toast-alert';

type ToastOptions = {
  message: string;
  status?: 'success' | 'warning' | 'error' | 'information' | 'feature';
  variant?: 'stroke' | 'filled' | 'faded';
  dismissable?: boolean;
};

export function useToast() {
  const showToast = ({ message, status = 'information', variant = 'stroke', dismissable = true }: ToastOptions) => {
    return toast.custom((t) => (
      <AlertToast
        t={t}
        message={message}
        status={status}
        variant={variant}
        dismissable={dismissable}
      />
    ));
  };

  return {
    toast: showToast,
    toastSuccess: (message: string, options?: Omit<ToastOptions, 'message' | 'status'>) =>
      showToast({ message, status: 'success', ...options }),
    toastError: (message: string, options?: Omit<ToastOptions, 'message' | 'status'>) =>
      showToast({ message, status: 'error', ...options }),
    toastWarning: (message: string, options?: Omit<ToastOptions, 'message' | 'status'>) =>
      showToast({ message, status: 'warning', ...options }),
    toastInformation: (message: string, options?: Omit<ToastOptions, 'message' | 'status'>) =>
      showToast({ message, status: 'information', ...options }),
  };
}
