import { http } from "@/shared/api/http";
import type { PagedResult } from "@/shared/types/common";
import type {
  InventoryItemDetailsDto,
  InventoryItemsTableParams,
  InventoryItemTableRowDto,
  InventoryStatisticsDto,
  ItemFieldValueRequest
} from "./types";

export function getInventoryItems(inventoryId: string, params: InventoryItemsTableParams = {}) {
  return http.get<PagedResult<InventoryItemTableRowDto>>(`/inventories/${inventoryId}/items`, {
    query: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      sortBy: params.sortBy,
      sortDescending: params.sortDescending ?? false
    }
  });
}

export function getInventoryStatistics(inventoryId: string) {
  return http.get<InventoryStatisticsDto>(`/inventories/${inventoryId}/statistics`);
}

export function getItemDetails(itemId: string) {
  return http.get<InventoryItemDetailsDto>(`/items/${itemId}`);
}

export function likeItem(itemId: string) {
  return http.post<void>(`/items/${itemId}/like`);
}

export function unlikeItem(itemId: string) {
  return http.delete<void>(`/items/${itemId}/like`);
}

export function createInventoryItem(inventoryId: string, fieldValues: ItemFieldValueRequest[]) {
  return http.post<string>(`/inventories/${inventoryId}/items`, {
    fieldValues
  });
}
