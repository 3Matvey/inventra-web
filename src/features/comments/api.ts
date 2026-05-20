import { http } from "@/shared/api/http";
import type { PagedResult } from "@/shared/types/common";
import type { InventoryCommentDto } from "./types";

export function getInventoryComments(inventoryId: string, page = 1, pageSize = 50) {
  return http.get<PagedResult<InventoryCommentDto>>(`/inventories/${inventoryId}/comments`, {
    query: { page, pageSize }
  });
}

export function addInventoryComment(inventoryId: string, bodyMarkdown: string) {
  return http.post<InventoryCommentDto>(`/inventories/${inventoryId}/comments`, {
    bodyMarkdown
  });
}
