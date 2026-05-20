import type { Guid } from "@/shared/types/common";
import type { InventoryFieldType } from "@/entities/inventory/types";

export type ItemFieldValueDto = {
  fieldId: Guid;
  fieldTitle: string;
  fieldType: InventoryFieldType;
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
};

export type InventoryItemTableRowDto = {
  id: Guid;
  customId: string;
  createdById: Guid;
  createdByUserName: string;
  createdAt: string;
  version: number;
  likesCount: number;
  fieldValues: ItemFieldValueDto[];
};

export type InventoryItemDetailsDto = InventoryItemTableRowDto & {
  inventoryId: Guid;
  sequenceNumber: number | null;
  updatedAt: string | null;
  isLikedByCurrentUser: boolean;
};

export type InventoryItemsTableParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDescending?: boolean;
};

export type ItemFieldValueRequest = {
  fieldId: Guid;
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
};

export type NumericFieldStatisticsDto = {
  fieldId: Guid;
  fieldTitle: string;
  min: number | null;
  max: number | null;
  average: number | null;
};

export type StringFieldFrequencyDto = {
  value: string;
  count: number;
};

export type StringFieldStatisticsDto = {
  fieldId: Guid;
  fieldTitle: string;
  mostFrequentValues: StringFieldFrequencyDto[];
};

export type InventoryStatisticsDto = {
  inventoryId: Guid;
  itemsCount: number;
  numericFields: NumericFieldStatisticsDto[];
  stringFields: StringFieldStatisticsDto[];
};
