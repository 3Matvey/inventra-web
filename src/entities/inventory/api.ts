import { http } from "@/shared/api/http";
import type { PagedResult } from "@/shared/types/common";
import type { InventorySearchParams, InventoryTableRowDto, TagCloudItemDto } from "./types";

export function getLatestInventories(page = 1, pageSize = 10) {
  return http.get<PagedResult<InventoryTableRowDto>>("/inventories/latest", {
    query: { page, pageSize }
  });
}

export function getTopInventories(count = 5) {
  return http.get<InventoryTableRowDto[]>("/inventories/top", {
    query: { count }
  });
}

export function searchInventories(params: InventorySearchParams) {
  return http.get<PagedResult<InventoryTableRowDto>>("/inventories/search", {
    query: {
      term: params.term ?? "",
      categoryId: params.categoryId,
      tagId: params.tagId,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20
    }
  });
}

export function getTagCloud(count = 50) {
  return http.get<TagCloudItemDto[]>("/tags/cloud", {
    query: { count }
  });
}
