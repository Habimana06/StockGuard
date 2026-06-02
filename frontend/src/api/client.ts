const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getGuestId(): string {
  const key = "stockguard-guest-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Guest-Id", getGuestId());

  const token = localStorage.getItem("stockguard-token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });

    const body: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errBody = body as { error?: string; code?: string };
      throw new ApiError(
        errBody.error ?? `Request failed (${res.status})`,
        res.status,
        errBody.code
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out — check your connection", 408, "TIMEOUT");
    }
    throw new ApiError("Network error — try again", 0, "NETWORK");
  } finally {
    clearTimeout(timeout);
  }
}
