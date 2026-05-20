export type AuthProvider = "Google" | "GitHub";

export function buildExternalLoginUrl(provider: AuthProvider, returnUrl = "/") {
  const params = new URLSearchParams({ returnUrl });
  return `/auth/external/${provider}?${params.toString()}`;
}
