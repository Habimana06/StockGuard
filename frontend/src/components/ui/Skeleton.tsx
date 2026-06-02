interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function DropPageSkeleton() {
  return (
    <div className="drop-skeleton">
      <Skeleton className="drop-skeleton__badge" />
      <Skeleton className="drop-skeleton__title" />
      <Skeleton className="drop-skeleton__line" />
      <Skeleton className="drop-skeleton__card" />
    </div>
  );
}
