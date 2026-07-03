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
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) (req as any).params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query) as any;
      if (schemas.headers) req.headers = schemas.headers.parse(req.headers) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(toValidationError(error));
      }

      next(error);
    }
  };
}
