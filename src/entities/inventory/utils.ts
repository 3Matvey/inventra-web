import { InventoryFieldType, InventoryIdElementType } from "./types";

export function getFieldTypeLabel(type: InventoryFieldType) {
  switch (type) {
    case InventoryFieldType.SingleLineText:
      return "Single-line text";
    case InventoryFieldType.MultiLineText:
      return "Multi-line text";
    case InventoryFieldType.Number:
      return "Number";
    case InventoryFieldType.Link:
      return "Link";
    case InventoryFieldType.Boolean:
      return "True/false";
  }
}

export function getIdElementTypeLabel(type: InventoryIdElementType) {
  switch (type) {
    case InventoryIdElementType.FixedText:
      return "Fixed text";
    case InventoryIdElementType.Random20BitNumber:
      return "20-bit random";
    case InventoryIdElementType.Random32BitNumber:
      return "32-bit random";
    case InventoryIdElementType.Random6DigitNumber:
      return "6-digit random";
    case InventoryIdElementType.Random9DigitNumber:
      return "9-digit random";
    case InventoryIdElementType.Guid:
      return "GUID";
    case InventoryIdElementType.DateTime:
      return "Date/time";
    case InventoryIdElementType.Sequence:
      return "Sequence";
  }
}
