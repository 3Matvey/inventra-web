import { http } from "@/shared/api/http";
import type { UserProfileResponse } from "./types";

export function getCurrentUser() {
  return http.get<UserProfileResponse>("/auth/me");
}
