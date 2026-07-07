import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

type ValidationTarget = "body" | "params" | "query" | "headers";

type RequestSchemas = Partial<Record<ValidationTarget, ZodTypeAny>>;

function formatIssuePath(path: (string | number)[]) {
  return path.length > 0 ? path.join(".") : "request";
}

function toValidationError(error: ZodError) {
  return {
    error: "Validation failed",
    message: "Invalid request data",
    issues: error.issues.map((issue) => ({
      path: formatIssuePath(issue.path.map((segment) => String(segment))),
      message: issue.message,
      code: issue.code,
    })),
  };
}

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        Object.defineProperty(req, 'body', { value: schemas.body.parse(req.body), writable: true, enumerable: true, configurable: true });
      }
      if (schemas.params) {
        Object.defineProperty(req, 'params', { value: schemas.params.parse(req.params), writable: true, enumerable: true, configurable: true });
      }
      if (schemas.query) {
        Object.defineProperty(req, 'query', { value: schemas.query.parse(req.query), writable: true, enumerable: true, configurable: true });
      }
      if (schemas.headers) {
        Object.defineProperty(req, 'headers', { value: schemas.headers.parse(req.headers), writable: true, enumerable: true, configurable: true });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(toValidationError(error));
      }

      next(error);
    }
  };
}
