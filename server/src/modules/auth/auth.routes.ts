import { Router } from "express";
import * as controller from "./auth.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import { authenticateSuperAdmin } from "../../common/middlewares/superAdminAuth";
import * as auditController from "./auth.audit.controller";
import requireTenant from "../../common/middlewares/requireTenant";
import {
	loginRateLimiter,
	passwordResetRateLimiter,
	refreshRateLimiter,
	verificationRateLimiter,
	exportRateLimiter,
} from "../../common/middlewares/rateLimiter";
import { validateRequest } from "../../common/middlewares/validateRequest";
import {
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from "./auth.schema";
import { z } from "zod";

const refreshRequestSchema = z.object({
	refreshToken: z.string().optional(),
	refresh_token: z.string().optional(),
});

const sessionParamsSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
});

const emptyQuerySchema = z.object({}).passthrough();

const router = Router();

router.post("/login", loginRateLimiter, validateRequest({ body: loginSchema }), controller.login);
router.post("/refresh", refreshRateLimiter, validateRequest({ body: refreshRequestSchema }), controller.refresh);
router.post("/demo-login", controller.demoLogin);

router.post("/forgot-password", passwordResetRateLimiter, validateRequest({ body: forgotPasswordSchema }), controller.forgotPassword);
router.post("/reset-password", passwordResetRateLimiter, validateRequest({ body: resetPasswordSchema }), controller.resetPassword);
router.post("/send-verification", verificationRateLimiter, validateRequest({ body: forgotPasswordSchema }), controller.sendVerification);
router.post("/verify-email", verificationRateLimiter, validateRequest({ body: verifyEmailSchema }), controller.verifyEmail);

router.post("/logout", authenticateJWT, controller.logout);
router.post("/logout-all", authenticateJWT, controller.logoutAll);
router.get("/sessions", authenticateJWT, controller.listSessions);
router.delete("/sessions/:sessionId", authenticateJWT, validateRequest({ params: sessionParamsSchema }), controller.revokeSession);

// Audit log endpoints (tenant owners or super-admin).
router.get("/logs", authenticateJWT, exportRateLimiter, validateRequest({ query: emptyQuerySchema }), auditController.listLogs);
router.get("/logs/export", authenticateJWT, exportRateLimiter, validateRequest({ query: emptyQuerySchema }), auditController.exportCsv);

router.get("/me", authenticateJWT, requireTenant, controller.me);

export default router;
