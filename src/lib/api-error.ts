// API error envelope, distilled from FLOF src/lib/api-error-contract.ts.
// Every API route returns errors in the same shape:
//   { "error": { "code", "message", "details"? }, "requestId": "..." }
//
// PURE LIB RULE: this file is exercised by "node --test" which cannot resolve
// the "@/" path alias, so it must only use relative or bare imports.

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ApiErrorDescriptor = {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

/** Throwable error carrying an HTTP status + stable machine-readable code. */
export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: unknown;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const SENSITIVE_DETAIL_KEY =
  /(password|token|secret|authorization|credential|api[_-]?key|cookie)/i;

/** Strips secret-looking keys so validation details never leak credentials. */
export function sanitizeApiErrorDetails(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map(sanitizeApiErrorDetails);
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (SENSITIVE_DETAIL_KEY.test(key) || entry === undefined) continue;
      output[key] = sanitizeApiErrorDetails(entry);
    }
    return output;
  }
  return String(value);
}

export function getApiRequestId(request?: Request) {
  return (
    request?.headers.get("x-request-id") ||
    crypto.randomUUID()
  );
}

export function createApiErrorResponse(
  descriptor: ApiErrorDescriptor,
  requestId: string,
) {
  const response = Response.json(
    {
      error: {
        code: descriptor.code,
        message: descriptor.message,
        ...(descriptor.details === undefined
          ? {}
          : { details: sanitizeApiErrorDetails(descriptor.details) }),
      },
      requestId,
    },
    { status: descriptor.status },
  );
  response.headers.set("x-request-id", requestId);
  return response;
}

export function jsonApiError(
  request: Request,
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  return createApiErrorResponse(
    { status, code, message, details },
    getApiRequestId(request),
  );
}

/** Maps any thrown value to the error envelope. Use in route catch blocks. */
export function toApiErrorResponse(request: Request, error: unknown) {
  if (error instanceof ApiError) {
    return jsonApiError(request, error.status, error.code, error.message, error.details);
  }
  // Never leak internal error messages/stack traces to clients.
  console.error("[api] unhandled error:", error);
  return jsonApiError(request, 500, "INTERNAL_ERROR", "Internal server error");
}
