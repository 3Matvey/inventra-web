import { InventoryFieldType } from "@/entities/inventory/types";
import type { ItemFieldValueDto } from "./types";

export function formatItemFieldValue(value: ItemFieldValueDto) {
  switch (value.fieldType) {
    case InventoryFieldType.Boolean:
      return value.booleanValue === null ? "—" : value.booleanValue ? "Yes" : "No";
    case InventoryFieldType.Number:
      return value.numberValue ?? "—";
    default:
      return value.textValue || "—";
  }
}
