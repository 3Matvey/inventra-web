import { http } from "@/shared/api/http";
import type { Guid } from "@/shared/types/common";

export type CreateSalesforceCustomerRequest = {
  accountName: string;
  firstName: string | null;
  lastName: string;
  email: string;
  phone: string | null;
  website: string | null;
};

export type SalesforceCustomerResponse = {
  accountId: string;
  contactId: string;
};

export function createSalesforceCustomer(userId: Guid, request: CreateSalesforceCustomerRequest) {
  return http.post<SalesforceCustomerResponse>(`/users/${userId}/salesforce/customer`, request);
}
