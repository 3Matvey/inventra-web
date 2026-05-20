import { http } from "@/shared/api/http";
import type { AutocompleteOptionDto } from "./types";

export function autocompleteTags(term: string, limit = 10) {
  return http.get<AutocompleteOptionDto[]>("/tags/autocomplete", {
    query: { term, limit }
  });
}
