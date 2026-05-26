import { InventoryFieldType, type InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import { getFieldTypeLabel } from "@/entities/inventory/utils";

export const defaultFieldType = InventoryFieldType.SingleLineText;

export const fieldTypeOptions = [
  InventoryFieldType.SingleLineText,
  InventoryFieldType.MultiLineText,
  InventoryFieldType.Number,
  InventoryFieldType.Link,
  InventoryFieldType.Boolean
].map((value) => ({
  label: getFieldTypeLabel(value),
  value
}));

export function countFieldsByType(fields: InventoryFieldDefinitionDto[], type: InventoryFieldType) {
  return fields.filter((field) => field.type === type).length;
}
