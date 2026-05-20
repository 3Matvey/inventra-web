import type { Guid } from "@/shared/types/common";

export type AutocompleteOptionDto = {
  id: Guid;
  label: string;
  description: string | null;
};
