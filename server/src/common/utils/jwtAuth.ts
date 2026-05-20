import jwt from "jsonwebtoken";
import { config } from "../config";

export type BearerTokenPayload = Record<string, unknown>;

const jwtVerifyOptions = {
  algorithms: ["HS256"],
};

export function extractBearerToken(
  authHeader: string | string[] | undefined,
): string | null {
  if (!authHeader || Array.isArray(authHeader)) {
    return null;
  }

  const [scheme, token, ...rest] = authHeader.trim().split(/\s+/);
  if (rest.length > 0 || !scheme || !token || !/^Bearer$/i.test(scheme)) {
    return null;
  }

  return token;
}

export function verifyJwtToken<TPayload extends BearerTokenPayload>(
  token: string,
): TPayload | null {
  if (!config.jwtSecret) {
    return null;
  }

  try {
    return jwt.verify(
      token,
      config.jwtSecret,
      jwtVerifyOptions as any,
    ) as TPayload;
  } catch {
    return null;
  }
}
