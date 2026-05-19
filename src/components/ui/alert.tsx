import * as React from 'react';
import { cn } from '#/utils/cn';
import { X } from 'lucide-react';

const AlertContext = React.createContext<{
  status?: 'success' | 'warning' | 'error' | 'information' | 'feature';
  variant?: 'stroke' | 'filled' | 'faded';
  size?: 'small' | 'medium';
}>({});

interface AlertRootProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'success' | 'warning' | 'error' | 'information' | 'feature';
  variant?: 'stroke' | 'filled' | 'faded';
  size?: 'small' | 'medium';
}

const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({ className, status = 'information', variant = 'stroke', size = 'medium', ...props }, ref) => {
    const statusClasses = {
      success: {
        stroke: 'border-success-light bg-bg-white-0 text-text-strong-950 dark:bg-bg-weak-50 dark:border-success-dark',
        filled: 'bg-success-base text-static-white border-transparent',
        faded: 'bg-success-lighter border-success-light text-success-dark dark:bg-success-alpha-10',
      },
      warning: {
        stroke: 'border-warning-light bg-bg-white-0 text-text-strong-950 dark:bg-bg-weak-50 dark:border-warning-dark',
        filled: 'bg-warning-base text-static-white border-transparent',
        faded: 'bg-warning-lighter border-warning-light text-warning-dark dark:bg-warning-alpha-10',
      },
      error: {
        stroke: 'border-error-light bg-bg-white-0 text-text-strong-950 dark:bg-bg-weak-50 dark:border-error-dark',
        filled: 'bg-error-base text-static-white border-transparent',
        faded: 'bg-error-lighter border-error-light text-error-dark dark:bg-error-alpha-10',
      },
      information: {
        stroke: 'border-information-light bg-bg-white-0 text-text-strong-950 dark:bg-bg-weak-50 dark:border-information-dark',
        filled: 'bg-information-base text-static-white border-transparent',
        faded: 'bg-information-lighter border-information-light text-information-dark dark:bg-information-alpha-10',
      },
      feature: {
        stroke: 'border-primary-light bg-bg-white-0 text-text-strong-950 dark:bg-bg-weak-50 dark:border-primary-dark',
        filled: 'bg-primary-base text-static-white border-transparent',
        faded: 'bg-primary-lighter border-primary-light text-primary-dark dark:bg-primary-alpha-10',
      },
    };


    return (
      <AlertContext.Provider value={{ status, variant, size }}>
        <div
          ref={ref}
          role="alert"
          className={cn(
            'flex w-full items-start gap-3 rounded-12 border p-4 text-paragraph-sm shadow-regular-sm transition-all',
            statusClasses[status][variant],
            size === 'small' && 'p-3 text-paragraph-xs',
            className
          )}
          {...props}
        />
      </AlertContext.Provider>
    );
  }
);
AlertRoot.displayName = 'AlertRoot';

interface AlertIconProps extends React.HTMLAttributes<SVGElement> {
  as?: React.ElementType;
}

const AlertIcon = ({ as: Icon, className, ...props }: AlertIconProps) => {
  const { status, variant } = React.useContext(AlertContext);
  
  const iconStatusClasses = {
    success: variant === 'filled' ? 'text-static-white' : 'text-success-base',
    warning: variant === 'filled' ? 'text-static-white' : 'text-warning-base',
    error: variant === 'filled' ? 'text-static-white' : 'text-error-base',
    information: variant === 'filled' ? 'text-static-white' : 'text-information-base',
    feature: variant === 'filled' ? 'text-static-white' : 'text-primary-base',
  };

  if (!Icon) return null;

  return (
    <Icon
      className={cn(
        'h-5 w-5 shrink-0',
        status && iconStatusClasses[status],
        className
      )}
      {...props}
    />
  );
};

const AlertCloseIcon = ({ className, ...props }: React.HTMLAttributes<SVGElement>) => {
  return (
    <X
      className={cn(
        'h-4 w-4 shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100',
        className
      )}
      {...props}
    />
  );
};

export { AlertRoot as Root, AlertIcon as Icon, AlertCloseIcon as CloseIcon };
