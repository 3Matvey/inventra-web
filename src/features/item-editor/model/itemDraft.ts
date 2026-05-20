import { reactive } from "vue";
import { InventoryFieldType, type InventoryFieldDefinitionDto } from "@/entities/inventory/types";
import type { InventoryItemDetailsDto, ItemFieldValueRequest } from "@/entities/item/types";

export type ItemDraftValue = {
  textValue: string;
  numberValue: number | null;
  booleanValue: boolean;
};

export function createItemDraft() {
  return reactive<Record<string, ItemDraftValue>>({});
}

export function ensureFieldDraft(draft: Record<string, ItemDraftValue>, fieldId: string) {
  draft[fieldId] = draft[fieldId] ?? {
    textValue: "",
    numberValue: null,
    booleanValue: false
  };

  return draft[fieldId];
}

export function fillDraftFromItem(
  draft: Record<string, ItemDraftValue>,
  fields: InventoryFieldDefinitionDto[],
  item: InventoryItemDetailsDto | null
) {
  fields.forEach((field) => {
    const fieldDraft = ensureFieldDraft(draft, field.id);
    const value = item?.fieldValues.find((current) => current.fieldId === field.id);

    fieldDraft.textValue = value?.textValue ?? "";
    fieldDraft.numberValue = value?.numberValue ?? null;
    fieldDraft.booleanValue = value?.booleanValue ?? false;
  });
}

export function toFieldValueRequest(
  draft: Record<string, ItemDraftValue>,
  field: InventoryFieldDefinitionDto
): ItemFieldValueRequest {
  const value = ensureFieldDraft(draft, field.id);

  if (field.type === InventoryFieldType.Number) {
    return { fieldId: field.id, textValue: null, numberValue: value.numberValue, booleanValue: null };
  }

  if (field.type === InventoryFieldType.Boolean) {
    return { fieldId: field.id, textValue: null, numberValue: null, booleanValue: value.booleanValue };
  }

  return {
    fieldId: field.id,
    textValue: value.textValue.trim() || null,
    numberValue: null,
    booleanValue: null
  };
}
