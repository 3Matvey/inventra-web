import { http } from "@/shared/api/http";
import type { AutocompleteOptionDto } from "@/entities/tag/types";
import type { UserProfileResponse } from "./types";

export function getCurrentUser() {
  return http.get<UserProfileResponse>("/auth/me");
}

export function logout() {
  return http.post<void>("/auth/logout");
}

export function autocompleteUsers(term: string, limit = 10) {
  return http.get<AutocompleteOptionDto[]>("/users/autocomplete", {
    query: { term, limit }
  });
}
