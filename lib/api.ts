export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiFailure {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function toApiError(error: unknown, fallbackMessage: string): ApiFailure {
  if (error instanceof Error) {
    return { data: null, error: error.message };
  }
  if (typeof error === "string") {
    return { data: null, error };
  }
  return { data: null, error: fallbackMessage };
}

