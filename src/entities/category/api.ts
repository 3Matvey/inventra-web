import { http } from "@/shared/api/http";
import type { CategoryDto } from "@/entities/inventory/types";

export function getCategories() {
  return http.get<CategoryDto[]>("/categories");
}
