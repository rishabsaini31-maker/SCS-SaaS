import jwt from "jsonwebtoken";
import { config } from "../config";

export type SuperAdminTokenPayload = {
  adminId: string;
  adminType: string;
  sessionId?: string;
};

export function signSuperAdminToken(
  payload: SuperAdminTokenPayload,
  expiresIn: string = "7d",
) {
  return (jwt as any).sign(payload, config.jwtSecret, { expiresIn });
}

export default signSuperAdminToken;
