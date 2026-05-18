import { Router } from "express";
import * as controller from "./auth.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";

const router = Router();

router.post("/login", controller.login);
router.get("/me", authenticateJWT, requireTenant, controller.me);

export default router;
