import jwt from "jsonwebtoken";
import { config } from "../config";

export function signAuthToken(
  payload: { userId: string; tenantId?: string; role?: string },
  expiresIn: string = "7d",
) {
  return (jwt as any).sign(payload, config.jwtSecret, { expiresIn });
}

export default signAuthToken;
