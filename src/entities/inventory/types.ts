import type { Guid } from "@/shared/types/common";

export type CategoryDto = {
  id: Guid;
  name: string;
};

export type TagDto = {
  id: Guid;
  name: string;
};

export type TagCloudItemDto = {
  id: Guid;
  name: string;
  inventoriesCount: number;
};

export type InventoryTableRowDto = {
  id: Guid;
  title: string;
  descriptionMarkdown: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  categoryName: string;
  ownerId: Guid;
  ownerName: string;
  itemsCount: number;
  tags: TagDto[];
  createdAt: string;
  updatedAt: string | null;
};

export type InventorySearchParams = {
  term?: string;
  categoryId?: Guid | null;
  tagId?: Guid | null;
  page?: number;
  pageSize?: number;
};
