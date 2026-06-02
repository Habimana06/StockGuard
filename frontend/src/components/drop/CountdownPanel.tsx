import { useEffect } from "react";
import { formatCountdown, useCountdown } from "../../hooks/useCountdown";

interface CountdownPanelProps {
  expiresAt: string;
  onExpired: () => void;
}

const TOTAL_SECONDS = 5 * 60;

export function CountdownPanel({ expiresAt, onExpired }: CountdownPanelProps) {
  const secondsLeft = useCountdown(expiresAt);

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpired();
    }
  }, [secondsLeft, onExpired]);

  if (secondsLeft === null) return null;

  const urgent = secondsLeft > 0 && secondsLeft < 60;
  const progress = Math.min(100, (secondsLeft / TOTAL_SECONDS) * 100);

  return (
    <section
      className={`countdown-panel ${urgent ? "countdown-panel--urgent" : ""}`}
      role="timer"
      aria-live="polite"
    >
      <div className="countdown-panel__ring" style={{ "--progress": `${progress}%` } as React.CSSProperties}>
        <span className="countdown-panel__time">{formatCountdown(secondsLeft)}</span>
      </div>
      <div className="countdown-panel__copy">
        <p className="countdown-panel__title">Reservation active</p>
        <p className="countdown-panel__sub">
          {urgent
            ? "Complete checkout now — your reservation is about to expire"
            : "You have 5 minutes to complete checkout before stock is released"}
        </p>
      </div>
    </section>
  );
}
