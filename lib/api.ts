/**
 * Cloudflare Worker base URL (no trailing slash).
 * Set in `.env`: `EXPO_PUBLIC_API_URL=https://subscriptions-api.<subdomain>.workers.dev`
 * Restart Metro after changing env files.
 */
function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/+$/, "");
}

export { getApiBaseUrl };

/**
 * Authenticated fetch for the Worker. Pass a Clerk session JWT from `useAuth().getToken()`.
 * Throws `ApiError` on non-2xx responses.
 */
export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(
  token: string | null,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(0, "EXPO_PUBLIC_API_URL is not configured.");
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    throw new ApiError(res.status, `API ${res.status} on ${path}`, body);
  }
  return res;
}
