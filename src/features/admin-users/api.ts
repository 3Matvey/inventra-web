import { http } from "@/shared/api/http";
import type { UserProfileResponse } from "@/entities/user/types";

export function getAdminUsers(page = 1, pageSize = 50) {
  return http.get<UserProfileResponse[]>("/admin/users", {
    query: { page, pageSize }
  });
}

export function blockUser(userId: string) {
  return http.post<void>(`/admin/users/${userId}/block`);
}

export function unblockUser(userId: string) {
  return http.post<void>(`/admin/users/${userId}/unblock`);
}

export function addAdminRole(userId: string) {
  return http.post<void>(`/admin/users/${userId}/admin-role`);
}

export function removeAdminRole(userId: string) {
  return http.delete<void>(`/admin/users/${userId}/admin-role`);
}

export function deleteUser(userId: string) {
  return http.delete<void>(`/admin/users/${userId}`);
}
