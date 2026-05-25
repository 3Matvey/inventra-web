import { http } from "@/shared/api/http";
import type { AutocompleteOptionDto } from "@/entities/tag/types";
import type { UserProfileResponse } from "./types";

export type PasswordIdentityUserInfo = {
  userId: string;
  userName: string;
  email: string;
};

export type RegisterWithPasswordRequest = {
  userName: string;
  email: string;
  password: string;
};

export type LoginWithPasswordRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export function getCurrentUser() {
  return http.get<UserProfileResponse>("/auth/me");
}

export function registerWithPassword(request: RegisterWithPasswordRequest) {
  return http.post<PasswordIdentityUserInfo>("/auth/register", request);
}

export function loginWithPassword(request: LoginWithPasswordRequest) {
  return http.post<void>("/auth/login", request);
}

export function resendEmailConfirmation(email: string) {
  return http.post<void>("/auth/resend-confirmation", { email });
}

export function logout() {
  return http.post<void>("/auth/logout");
}

export function autocompleteUsers(term: string, limit = 10) {
  return http.get<AutocompleteOptionDto[]>("/users/autocomplete", {
    query: { term, limit }
  });
}
