import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'rounded-panel border border-border bg-surface py-20 px-6 text-center',
        className
      )}
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-panel bg-surface-subtle text-text-disabled">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 text-text-secondary max-w-[360px] mx-auto leading-relaxed">
        {message}
      </p>
      {action}
    </div>
  );
}
