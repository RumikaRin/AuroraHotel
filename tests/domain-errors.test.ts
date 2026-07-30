import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../src/domain/errors.ts";

describe("Domain error hierarchy", () => {
  it("creates structured domain errors with code and status", () => {
    const err = new NotFoundError("Room not found");
    assert.ok(err instanceof DomainError);
    assert.equal(err.code, "NOT_FOUND");
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Room not found");
  });

  it("creates validation and conflict errors", () => {
    const val = new ValidationError("Invalid date range");
    assert.equal(val.code, "VALIDATION_ERROR");
    assert.equal(val.statusCode, 422);

    const err = new ConflictError("Room no longer available");
    assert.equal(err.code, "CONFLICT");
    assert.equal(err.statusCode, 409);
  });

  it("creates unauthorized and forbidden errors", () => {
    const unauth = new UnauthorizedError();
    assert.equal(unauth.statusCode, 401);
    const forb = new ForbiddenError();
    assert.equal(forb.statusCode, 403);
  });
});
