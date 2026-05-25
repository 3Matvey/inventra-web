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

export function getFormatHelp(type: InventoryIdElementType) {
  switch (type) {
    case InventoryIdElementType.FixedText:
      return [
        "Fixed text is inserted exactly as typed.",
        "Unicode is supported, so prefixes like INV-Ж- or 📦- are valid.",
        "This element does not use a format value."
      ];
    case InventoryIdElementType.Guid:
      return [
        "Use standard GUID formats: D, N, B, P, or X.",
        "D example: 7f9c2a1e-7b31-4a4d-9b5d-2c9dfcbbf19a.",
        "N removes dashes; B and P wrap the value in braces or parentheses."
      ];
    case InventoryIdElementType.DateTime:
      return [
        "Use .NET date/time patterns.",
        "yyyyMMdd gives 20260525.",
        "yyyy-MM-dd-HHmm gives 2026-05-25-1430."
      ];
    case InventoryIdElementType.Sequence:
      return [
        "Sequence is the largest existing sequence number in this inventory plus one.",
        "D4 or 0000 pads values with leading zeros.",
        "Existing item IDs are not regenerated when this format changes."
      ];
    default:
      return [
        "Use .NET numeric format strings.",
        "D6 pads integer-like values to six digits.",
        "Custom zero patterns such as 00000000 keep leading zeros."
      ];
  }
}

export function sortIdElements(elements: InventoryIdFormatElementDto[]) {
  return [...elements].sort((left, right) => left.order - right.order);
}
