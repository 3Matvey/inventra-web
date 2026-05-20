import { http } from "@/shared/api/http";
import type { Guid } from "@/shared/types/common";
import { uploadInventoryImage, type UploadedImageDto } from "@/features/inventory-settings/api";

export type CreateInventoryRequest = {
  categoryId: Guid;
  title: string;
  descriptionMarkdown: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  tags: string[];
};

export function createInventory(request: CreateInventoryRequest) {
  return http.post<Guid>("/inventories", request);
}

export { uploadInventoryImage, type UploadedImageDto };
