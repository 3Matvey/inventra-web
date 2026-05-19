import { http } from "@/shared/api/http";
import type { PagedResult } from "@/shared/types/common";
import type {
  InventoryItemDetailsDto,
  InventoryItemsTableParams,
  InventoryItemTableRowDto,
  InventoryStatisticsDto
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
