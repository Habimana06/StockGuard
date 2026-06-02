import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { formatCountdown, useCountdown } from "./useCountdown";

describe("formatCountdown", () => {
  it("pads seconds under ten", () => {
    expect(formatCountdown(125)).toBe("2:05");
    expect(formatCountdown(60)).toBe("1:00");
  });
});

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down to zero", () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString();
    const { result } = renderHook(() => useCountdown(expiresAt));

    expect(result.current).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current).toBe(0);
  });

  it("returns null when no expiry", () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toBeNull();
  });
});
