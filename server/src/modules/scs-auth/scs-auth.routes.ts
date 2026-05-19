import { Router } from "express";
import * as controller from "./scs-auth.controller";
import {
  authenticateSuperAdmin,
  requireSuperAdmin,
} from "../../common/middlewares/superAdminAuth";
import { superAdminLoginRateLimiter } from "../../common/middlewares/rateLimiter";

const router = Router();

// SECURITY: STRICT rate limiting for super admin login (3 attempts per 15 minutes)
router.post("/login", superAdminLoginRateLimiter, controller.login);

// SECURITY: Logout with server-side session revocation
router.post(
  "/logout",
  authenticateSuperAdmin,
  requireSuperAdmin,
  controller.logout,
);

router.get("/me", authenticateSuperAdmin, requireSuperAdmin, controller.me);

export default router;
