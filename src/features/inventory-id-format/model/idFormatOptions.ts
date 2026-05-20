import { InventoryIdElementType, type InventoryIdFormatElementDto } from "@/entities/inventory/types";
import { getIdElementTypeLabel } from "@/entities/inventory/utils";

export const recommendedMaxIdElements = 10;
export const defaultIdElementType = InventoryIdElementType.FixedText;

export const idElementTypeOptions = [
  InventoryIdElementType.FixedText,
  InventoryIdElementType.Random20BitNumber,
  InventoryIdElementType.Random32BitNumber,
  InventoryIdElementType.Random6DigitNumber,
  InventoryIdElementType.Random9DigitNumber,
  InventoryIdElementType.Guid,
  InventoryIdElementType.DateTime,
  InventoryIdElementType.Sequence
].map((value) => ({
  label: getIdElementTypeLabel(value),
  value
}));

export function needsValue(type: InventoryIdElementType) {
  return type === InventoryIdElementType.FixedText;
}

export function supportsFormat(type: InventoryIdElementType) {
  return type !== InventoryIdElementType.FixedText;
}

export function getFormatHint(type: InventoryIdElementType) {
  switch (type) {
    case InventoryIdElementType.FixedText:
      return "Fixed text is inserted exactly as typed.";
    case InventoryIdElementType.Guid:
      return "GUID formats: D, N, B, P, X.";
    case InventoryIdElementType.DateTime:
      return "Date/time example: yyyyMMdd, yyyyMMddHHmmss, yyyy-MM-dd.";
    case InventoryIdElementType.Random6DigitNumber:
      return "Default is D6. Use number formats like D6 or 000000.";
    case InventoryIdElementType.Random9DigitNumber:
      return "Default is D9. Use number formats like D9 or 000000000.";
    case InventoryIdElementType.Sequence:
      return "Use number formats like D4 or 0000 for leading zeros.";
    default:
      return "Use .NET numeric formats, for example D8 or 00000000.";
  }
}

export function sortIdElements(elements: InventoryIdFormatElementDto[]) {
  return [...elements].sort((left, right) => left.order - right.order);
}
