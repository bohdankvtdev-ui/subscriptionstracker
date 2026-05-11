import type { Href } from "expo-router";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your email address.";
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter your password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "Confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function getClerkErrorMessage(error: unknown): string | null {
  if (error == null) return null;
  if (typeof error === "object" && error !== null && "errors" in error) {
    const withErrors = error as {
      errors?: { message?: string; longMessage?: string }[];
    };
    const first = withErrors.errors?.[0];
    const msg = first?.longMessage ?? first?.message;
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return null;
}

type ExpoRouterLike = {
  replace: (href: Href) => void;
};

/** After sign-in / sign-up, land in the main tab stack. */
export function postAuthNavigate(router: ExpoRouterLike) {
  return ({
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  }) => {
    if (session?.currentTask) return;
    const url = decorateUrl("/(tabs)");
    if (url.startsWith("http")) {
      const w = globalThis as typeof globalThis & {
        window?: { location: { href: string } };
      };
      if (w.window) w.window.location.href = url;
      return;
    }
    router.replace(url as Href);
  };
}
