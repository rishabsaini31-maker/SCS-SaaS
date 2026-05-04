import { Request, Response, NextFunction } from "express";

const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100;
const ipRequestCounts: Record<string, { count: number; startTime: number }> =
  {};

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const now = Date.now();
  if (
    !ipRequestCounts[ip] ||
    now - ipRequestCounts[ip].startTime > rateLimitWindowMs
  ) {
    ipRequestCounts[ip] = { count: 1, startTime: now };
  } else {
    ipRequestCounts[ip].count++;
  }
  if (ipRequestCounts[ip].count > maxRequests) {
    return res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  }
  next();
}
