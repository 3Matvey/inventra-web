import type { Guid } from "@/shared/types/common";

export type UserProfileResponse = {
  id: Guid;
  userName: string;
  email: string;
  isBlocked: boolean;
  isAdmin: boolean;
};
