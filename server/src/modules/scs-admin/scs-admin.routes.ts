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
  adminSearchRateLimiter,
} from "../../common/middlewares/rateLimiter";
import { validateRequest } from "../../common/middlewares/validateRequest";
import {
  createShopSchema,
  resetOwnerPasswordSchema,
  tenantIdParamSchema,
  tenantStatusSchema,
  updateShopSchema,
} from "./scs-admin.schema";
import { z } from "zod";

const adminSessionsParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

const router = Router();

// SECURITY: Attach audit context to all requests
router.use(auditContextMiddleware);

router.use(authenticateSuperAdmin, requireSuperAdmin);

router.get("/dashboard", adminSearchRateLimiter, controller.dashboard);
router.get("/tenants", adminSearchRateLimiter, controller.list);

// SECURITY: Active Sessions Dashboard
router.get("/sessions", adminSearchRateLimiter, controller.getMySessions);
router.delete("/sessions/:sessionId", validateRequest({ params: adminSessionsParamsSchema }), controller.revokeSession);

// SECURITY: Rate limiting for shop creation (10 per hour)
router.post("/shops", shopCreationRateLimiter, validateRequest({ body: createShopSchema }), controller.createShop);

router.patch("/tenants/:tenantId", validateRequest({ params: tenantIdParamSchema, body: updateShopSchema }), controller.updateShop);
router.patch("/tenants/:tenantId/status", validateRequest({ params: tenantIdParamSchema, body: tenantStatusSchema }), controller.updateStatus);

// SECURITY: Rate limiting for password reset (3 per hour)
router.post(
  "/tenants/:tenantId/reset-owner-password",
  passwordResetRateLimiter,
  validateRequest({ params: tenantIdParamSchema, body: resetOwnerPasswordSchema }),
  controller.resetOwnerPassword,
);

export default router;
