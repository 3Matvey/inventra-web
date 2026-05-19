import { appConfig } from "@/shared/config/appConfig";
import { ApiError, type ApiErrorPayload } from "./errors";

type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null | undefined;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: RequestBody;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${appConfig.apiBaseUrl}${normalizedPath}`;
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function parsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) return null;
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

function isJsonBody(body: RequestBody): body is Record<string, unknown> | unknown[] {
  return typeof body === "object" && body !== null && !(body instanceof FormData);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const body = isJsonBody(options.body) ? JSON.stringify(options.body) : options.body;

  if (isJsonBody(options.body) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    body: body as BodyInit | null | undefined,
    headers,
    credentials: "include"
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError(response.status, payload as ApiErrorPayload | null, response.statusText);
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: RequestBody, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: RequestBody, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" })
};
