import { http } from "@/shared/api/http";

export type UploadedImageDto = {
  url: string;
  publicId: string;
  contentType: string;
  size: number;
};

export function uploadInventoryImage(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  return http.post<UploadedImageDto>("/uploads/images", formData);
}
