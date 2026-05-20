import type { Guid } from "@/shared/types/common";

export type InventoryCommentDto = {
  id: Guid;
  inventoryId: Guid;
  authorId: Guid;
  authorUserName: string;
  bodyMarkdown: string;
  createdAt: string;
};
