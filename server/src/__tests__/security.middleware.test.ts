import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response, NextFunction } from "express";
import { sanitizeBody, securityHeaders, validateJsonPayload } from "../common/middlewares/security";

function createMockResponse() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    body: undefined as unknown,
    headers,
  } as unknown as Response;

  return res;
}

test("validateJsonPayload rejects suspicious object keys", () => {
  const req = {
    is: () => "application/json",
    body: { "../config": "value" },
  } as unknown as Request;
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  const result = validateJsonPayload(req, res, next);

  assert.equal(result, res);
  assert.equal(res.statusCode, 400);
  assert.equal(nextCalled, false);
  assert.deepEqual(res.body, { error: "Invalid request payload" });
});

test("sanitizeBody removes null bytes and control characters", () => {
  const req = {
    body: {
      name: "A\u0000bad\nvalue",
      nested: { note: "hello\u0007world" },
      password: "s3cr3t",
    },
  } as unknown as Request;
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  sanitizeBody(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.body.name, "Abadvalue");
  assert.equal(req.body.nested.note, "helloworld");
  assert.equal(req.body.password, "s3cr3t");
});

test("securityHeaders sets strict security policies", () => {
  const req = {} as Request;
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  securityHeaders(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(res.headers["X-Content-Type-Options"], "nosniff");
  assert.match(res.headers["Content-Security-Policy"], /default-src 'none'/);
  assert.equal(res.headers["Permissions-Policy"], "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()" );
});
