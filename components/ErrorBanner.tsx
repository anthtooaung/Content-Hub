'use client';

import { clsx } from 'clsx';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ErrorBannerVariant = 'error' | 'warning' | 'info';

interface ErrorBannerProps {
  variant: ErrorBannerVariant;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

const icons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  error: {
    banner: 'bg-error-soft border border-red-200',
    icon: 'bg-error text-white',
    title: 'text-error',
  },
  warning: {
    banner: 'bg-warning-soft border border-warning-border',
    icon: 'bg-warning text-white',
    title: 'text-warning',
  },
  info: {
    banner: 'bg-info-soft border border-sky-200',
    icon: 'bg-info text-white',
    title: 'text-info',
  },
};

export default function ErrorBanner({
  variant,
  title,
  message,
  action,
  secondaryAction,
  onDismiss,
  className,
}: ErrorBannerProps) {
  const Icon = icons[variant];
  const style = styles[variant];

  return (
    <div
      className={clsx(
        'flex gap-3.5 rounded-card p-5 mb-5 animate-[slideInUp_0.3s_ease]',
        style.banner,
        className
      )}
    >
      <div
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          style.icon
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={clsx('text-sm font-semibold mb-1', style.title)}>
          {title}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-2.5">
          {message}
        </p>
        {(action || secondaryAction) && (
          <div className="flex gap-2 flex-wrap">
            {action && (
              <button
                onClick={action.onClick}
                className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="text-sm font-medium text-primary hover:underline"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
