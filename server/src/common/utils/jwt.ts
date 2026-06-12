import jwt from "jsonwebtoken";
import { config } from "../config";

export type AuthTokenPayload = {
  userId: string;
  tenantId: string;
  sessionId?: string;
  role?: string;
  staffId?: string;
};

export function signAuthToken(
  payload: AuthTokenPayload,
  expiresIn: string = "7d",
) {
  return (jwt as any).sign(payload, config.jwtSecret, { expiresIn });
}

export default signAuthToken;
