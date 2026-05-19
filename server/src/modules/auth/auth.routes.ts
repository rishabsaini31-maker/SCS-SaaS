import { Router } from "express";
import * as controller from "./auth.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";
import { loginRateLimiter } from "../../common/middlewares/rateLimiter";

const router = Router();

// SECURITY: Strict rate limiting for login (5 attempts per 15 minutes)
router.post("/login", loginRateLimiter, controller.login);

// SECURITY: Logout with server-side session revocation
router.post("/logout", authenticateJWT, controller.logout);

router.get("/me", authenticateJWT, requireTenant, controller.me);

export default router;
