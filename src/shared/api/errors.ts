export type ApiErrorPayload = {
  code?: string;
  description?: string;
  errorType?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null, fallbackMessage: string) {
    super(payload?.description ?? payload?.detail ?? payload?.title ?? fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
