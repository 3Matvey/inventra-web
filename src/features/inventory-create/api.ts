import { http } from "@/shared/api/http";
import type { Guid } from "@/shared/types/common";

export type CreateInventoryRequest = {
  categoryId: Guid;
  title: string;
  descriptionMarkdown: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  tags: string[];
};

export type UploadedImageDto = {
  url: string;
  publicId: string;
  contentType: string;
  size: number;
};

export function createInventory(request: CreateInventoryRequest) {
  return http.post<Guid>("/inventories", request);
}

export function uploadInventoryImage(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  return http.post<UploadedImageDto>("/uploads/images", formData);
}
