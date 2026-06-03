import { useEffect } from "react";
import { formatCountdown, useCountdown } from "../../hooks/useCountdown";

interface CountdownPanelProps {
  expiresAt: string;
  onExpired: () => void;
}

const TOTAL_SECONDS = 5 * 60;

function splitTime(totalSeconds: number): { minutes: string; seconds: string } {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return {
    minutes: m.toString().padStart(2, "0"),
    seconds: s.toString().padStart(2, "0"),
  };
}

export function CountdownPanel({ expiresAt, onExpired }: CountdownPanelProps) {
  const secondsLeft = useCountdown(expiresAt);

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpired();
    }
  }, [secondsLeft, onExpired]);

  if (secondsLeft === null) return null;

  const urgent = secondsLeft > 0 && secondsLeft < 60;
  const critical = secondsLeft > 0 && secondsLeft < 30;
  const progress = Math.min(100, (secondsLeft / TOTAL_SECONDS) * 100);
  const { minutes, seconds } = splitTime(secondsLeft);
  const expired = secondsLeft === 0;

  return (
    <section
      className={`countdown-panel ${urgent ? "countdown-panel--urgent" : ""} ${critical ? "countdown-panel--critical" : ""} ${expired ? "countdown-panel--expired" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatCountdown(secondsLeft)}`}
    >
      <div className="countdown-panel__header">
        <span className="countdown-panel__badge">
          {expired ? "Expired" : urgent ? "Hurry" : "Active hold"}
        </span>
        <p className="countdown-panel__label">Time left to checkout</p>
      </div>

      <div className="countdown-panel__clock">
        <div className="countdown-panel__digit-group">
          <span className="countdown-panel__digit">{minutes}</span>
          <span className="countdown-panel__unit">min</span>
        </div>
        <span className="countdown-panel__sep" aria-hidden>
          :
        </span>
        <div className="countdown-panel__digit-group">
          <span className="countdown-panel__digit">{seconds}</span>
          <span className="countdown-panel__unit">sec</span>
        </div>
      </div>

      <div className="countdown-panel__progress-wrap">
        <div
          className="countdown-panel__progress-bar"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={secondsLeft}
          aria-valuemin={0}
          aria-valuemax={TOTAL_SECONDS}
        />
      </div>

      <p className="countdown-panel__message">
        {expired
          ? "Your reservation has expired — stock was released."
          : critical
            ? "Less than 30 seconds — complete checkout immediately!"
            : urgent
              ? "Under one minute left — finish checkout now."
              : "Complete checkout before the timer reaches zero."}
      </p>
    </section>
  );
}
