import { useEffect, useState } from "react";

/** Ticks every second until expiresAt — returns null when time is up */
export function useCountdown(expiresAt: string | null): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      setSecondsLeft(diff > 0 ? diff : 0);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return secondsLeft;
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
