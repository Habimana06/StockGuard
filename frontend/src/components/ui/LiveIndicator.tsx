interface LiveIndicatorProps {
  isRefreshing: boolean;
  lastRefreshedAt: Date | null;
}

function secondsAgo(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
}

export function LiveIndicator({ isRefreshing, lastRefreshedAt }: LiveIndicatorProps) {
  const label =
    isRefreshing || !lastRefreshedAt
      ? "Syncing stock…"
      : `Stock updated ${secondsAgo(lastRefreshedAt)}s ago`;

  return (
    <div
      className={`live-indicator ${isRefreshing ? "live-indicator--pulse" : ""}`}
      title="Inventory refreshes every 5 seconds"
    >
      <span className="live-indicator__dot" aria-hidden />
      <span className="live-indicator__text">{label}</span>
    </div>
  );
}
