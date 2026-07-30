export class DomainError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = "DOMAIN_ERROR", statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class ConflictError extends DomainError {
  constructor(message = "Resource state conflict") {
    super(message, "CONFLICT", 409);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Permission denied") {
    super(message, "FORBIDDEN", 403);
  }
}
