import { http } from "@/shared/api/http";
import type { Guid } from "@/shared/types/common";

export type SupportTicketPriority = "High" | "Average" | "Low";

export type CreateSupportTicketRequest = {
  summary: string;
  priority: SupportTicketPriority;
  link: string;
  adminEmails: string[];
  inventoryId: Guid | null;
};

export function createSupportTicket(request: CreateSupportTicketRequest) {
  return http.post<void>("/support/tickets", request);
}
