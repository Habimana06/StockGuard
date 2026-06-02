import { formatCountdown, useCountdown } from "../hooks/useCountdown";
import { useEffect } from "react";

interface CountdownBannerProps {
  expiresAt: string;
  onExpired: () => void;
}

export function CountdownBanner({ expiresAt, onExpired }: CountdownBannerProps) {
  const secondsLeft = useCountdown(expiresAt);

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpired();
    }
  }, [secondsLeft, onExpired]);

  if (secondsLeft === null) return null;

  const urgent = secondsLeft < 60;

  return (
    <div className={`countdown ${urgent ? "countdown--urgent" : ""}`} role="timer">
      <p className="countdown__title">Your reservation expires in</p>
      <p className="countdown__time">{formatCountdown(secondsLeft)}</p>
      {secondsLeft === 0 ? (
        <p className="countdown__expired">Reservation expired — stock returned to the pool.</p>
      ) : null}
    </div>
  );
}
