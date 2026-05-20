import { http } from "@/shared/api/http";
import type { PagedResult } from "@/shared/types/common";
import type {
  InventoryFieldDefinitionDto,
  InventoryFieldType,
  InventoryDetailsDto,
  InventoryIdElementType,
  InventoryIdFormatElementDto,
  InventorySearchParams,
  InventoryTableRowDto,
  TagCloudItemDto
} from "./types";

export function getInventoryDetails(inventoryId: string) {
  return http.get<InventoryDetailsDto>(`/inventories/${inventoryId}`);
}

export type AddInventoryFieldRequest = {
  expectedVersion: number;
  type: InventoryFieldType;
  title: string;
  description: string | null;
  showInTable: boolean;
};

export type UpdateInventoryFieldRequest = {
  expectedVersion: number;
  title: string;
  description: string | null;
  showInTable: boolean;
};

export function addInventoryField(inventoryId: string, request: AddInventoryFieldRequest) {
  return http.post<string>(`/inventories/${inventoryId}/fields`, request);
}

export function updateInventoryField(
  inventoryId: string,
  fieldId: string,
  request: UpdateInventoryFieldRequest
) {
  return http.put<void>(`/inventories/${inventoryId}/fields/${fieldId}`, request);
}

export function removeInventoryField(inventoryId: string, field: InventoryFieldDefinitionDto, version: number) {
  return http.delete<void>(`/inventories/${inventoryId}/fields/${field.id}`, {
    query: { expectedVersion: version }
  });
}

export function reorderInventoryFields(
  inventoryId: string,
  expectedVersion: number,
  orderedFieldIds: string[]
) {
  return http.put<void>(`/inventories/${inventoryId}/fields/order`, {
    expectedVersion,
    orderedFieldIds
  });
}

export type AddInventoryIdFormatElementRequest = {
  expectedVersion: number;
  type: InventoryIdElementType;
  value: string | null;
  format: string | null;
};

export type UpdateInventoryIdFormatElementRequest = {
  expectedVersion: number;
  value: string | null;
  format: string | null;
};

export function previewInventoryCustomId(inventoryId: string) {
  return http.get<string>(`/inventories/${inventoryId}/id-format/preview`);
}

export function addInventoryIdFormatElement(
  inventoryId: string,
  request: AddInventoryIdFormatElementRequest
) {
  return http.post<string>(`/inventories/${inventoryId}/id-format/elements`, request);
}

export function updateInventoryIdFormatElement(
  inventoryId: string,
  elementId: string,
  request: UpdateInventoryIdFormatElementRequest
) {
  return http.put<void>(`/inventories/${inventoryId}/id-format/elements/${elementId}`, request);
}

export function removeInventoryIdFormatElement(
  inventoryId: string,
  element: InventoryIdFormatElementDto,
  version: number
) {
  return http.delete<void>(`/inventories/${inventoryId}/id-format/elements/${element.id}`, {
    query: { expectedVersion: version }
  });
}

export function reorderInventoryIdFormatElements(
  inventoryId: string,
  expectedVersion: number,
  orderedElementIds: string[]
) {
  return http.put<void>(`/inventories/${inventoryId}/id-format/elements/order`, {
    expectedVersion,
    orderedElementIds
  });
}

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
