import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError, apiFetch } from "./client";

describe("apiFetch error handling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  it("throws ApiError on 409 conflict", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: "Not enough stock", code: "CONFLICT" }),
    } as Response);

    await expect(apiFetch("/api/reserve")).rejects.toMatchObject({
      status: 409,
      message: "Not enough stock",
    } satisfies Partial<ApiError>);
  });

  it("maps network failures to ApiError", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiFetch("/products")).rejects.toMatchObject({
      code: "NETWORK",
    } satisfies Partial<ApiError>);
  });
});
