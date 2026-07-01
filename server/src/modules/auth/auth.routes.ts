import { Router } from "express";
import * as controller from "./auth.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import { authenticateSuperAdmin } from "../../common/middlewares/superAdminAuth";
import * as auditController from "./auth.audit.controller";
import requireTenant from "../../common/middlewares/requireTenant";
import { loginRateLimiter, passwordResetRateLimiter } from "../../common/middlewares/rateLimiter";

const router = Router();

router.post("/login", loginRateLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/demo-login", controller.demoLogin);

router.post("/forgot-password", passwordResetRateLimiter, controller.forgotPassword);
router.post("/reset-password", passwordResetRateLimiter, controller.resetPassword);
router.post("/send-verification", passwordResetRateLimiter, controller.sendVerification);
router.post("/verify-email", controller.verifyEmail);

router.post("/logout", authenticateJWT, controller.logout);
router.post("/logout-all", authenticateJWT, controller.logoutAll);
router.get("/sessions", authenticateJWT, controller.listSessions);
router.delete("/sessions/:sessionId", authenticateJWT, controller.revokeSession);

// Audit log endpoints (tenant owners or super-admin).
router.get("/logs", authenticateJWT, authenticateSuperAdmin, auditController.listLogs);
router.get("/logs/export", authenticateJWT, authenticateSuperAdmin, auditController.exportCsv);

router.get("/me", authenticateJWT, requireTenant, controller.me);

export default router;
