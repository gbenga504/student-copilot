import axios from "axios";

type ApiErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  data?: unknown;
};

export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly fields?: Record<string, string[]>;
  readonly data?: unknown;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.code = response.code;
    this.statusCode = response.statusCode;
    this.fields = response.fields;
    this.data = response.data;
  }
}

export function throwApiError(error: unknown): never {
  if (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    isApiErrorResponse(error.response?.data)
  ) {
    throw new ApiError(error.response.data);
  }

  throw new ApiError({
    statusCode: axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500,
    code: "UNEXPECTED_ERROR",
    message: "An unexpected error occurred",
  });
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "statusCode" in value &&
    typeof value.statusCode === "number" &&
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}
