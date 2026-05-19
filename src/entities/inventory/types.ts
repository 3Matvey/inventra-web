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

export enum InventoryFieldType {
  SingleLineText = 1,
  MultiLineText = 2,
  Number = 3,
  Link = 4,
  Boolean = 5
}

export enum InventoryIdElementType {
  FixedText = 1,
  Random20BitNumber = 2,
  Random32BitNumber = 3,
  Random6DigitNumber = 4,
  Random9DigitNumber = 5,
  Guid = 6,
  DateTime = 7,
  Sequence = 8
}

export type UserSummaryDto = {
  id: Guid;
  userName: string;
};

export type InventoryFieldDefinitionDto = {
  id: Guid;
  type: InventoryFieldType;
  title: string;
  description: string | null;
  showInTable: boolean;
  order: number;
};

export type InventoryIdFormatElementDto = {
  id: Guid;
  type: InventoryIdElementType;
  value: string | null;
  format: string | null;
  order: number;
};

export type InventoryAccessUserDto = {
  userId: Guid;
  userName: string;
  email: string;
  grantedAt: string;
};

export type InventoryDetailsDto = {
  id: Guid;
  title: string;
  descriptionMarkdown: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: CategoryDto;
  owner: UserSummaryDto;
  isPublicWriteAccess: boolean;
  version: number;
  tags: TagDto[];
  fields: InventoryFieldDefinitionDto[];
  idFormatElements: InventoryIdFormatElementDto[];
  accessUsers: InventoryAccessUserDto[];
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
