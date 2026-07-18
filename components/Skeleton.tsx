import { clsx } from 'clsx';

interface SkeletonLineProps {
  className?: string;
}

export function SkeletonLine({ className }: SkeletonLineProps) {
  return (
    <div
      className={clsx(
        'h-3 rounded-md bg-gradient-to-r from-surface-subtle via-border to-surface-subtle bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  );
}

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={clsx(
        'h-16 rounded-panel bg-gradient-to-r from-surface-subtle via-border to-surface-subtle bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={clsx(
        'rounded-panel border border-border bg-surface p-4 mb-4',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-gradient-to-r from-surface-subtle via-border to-surface-subtle bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-4 w-20 rounded bg-gradient-to-r from-surface-subtle via-border to-surface-subtle bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      </div>
      <SkeletonLine className="w-4/5 mb-2" />
      <SkeletonLine className="w-3/5 mb-2" />
      <SkeletonLine className="w-2/5" />
    </div>
  );
}
