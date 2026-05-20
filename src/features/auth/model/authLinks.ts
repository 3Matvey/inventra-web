import { appConfig } from "@/shared/config/appConfig";

export type AuthProvider = "Google" | "GitHub";

export function buildExternalLoginUrl(provider: AuthProvider, returnUrl = "/") {
  const params = new URLSearchParams({ returnUrl });
  return `${appConfig.apiBaseUrl}/auth/external/${provider}?${params.toString()}`;
}
