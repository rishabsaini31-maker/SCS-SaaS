import { Request, Response, NextFunction } from "express";

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // JWT authentication structure placeholder
  next();
}
