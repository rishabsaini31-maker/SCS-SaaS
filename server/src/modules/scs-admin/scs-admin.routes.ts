import { Router } from "express";
import * as controller from "./scs-admin.controller";
import {
  authenticateSuperAdmin,
  requireSuperAdmin,
} from "../../common/middlewares/superAdminAuth";
import { auditContextMiddleware } from "../../common/middlewares/auditContext";
import {
  shopCreationRateLimiter,
  passwordResetRateLimiter,
} from "../../common/middlewares/rateLimiter";

const router = Router();

// SECURITY: Attach audit context to all requests
router.use(auditContextMiddleware);

router.use(authenticateSuperAdmin, requireSuperAdmin);

router.get("/dashboard", controller.dashboard);
router.get("/tenants", controller.list);

// SECURITY: Active Sessions Dashboard
router.get("/sessions", controller.getMySessions);
router.delete("/sessions/:sessionId", controller.revokeSession);

// SECURITY: Rate limiting for shop creation (10 per hour)
router.post("/shops", shopCreationRateLimiter, controller.createShop);

router.patch("/tenants/:tenantId", controller.updateShop);
router.patch("/tenants/:tenantId/status", controller.updateStatus);

// SECURITY: Rate limiting for password reset (3 per hour)
router.post(
  "/tenants/:tenantId/reset-owner-password",
  passwordResetRateLimiter,
  controller.resetOwnerPassword,
);

export default router;
