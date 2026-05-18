import { Router } from "express";
import * as controller from "./tenant.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";

const router = Router();

router.get("/", authenticateJWT, requireTenant, controller.list);
router.get("/:id", authenticateJWT, requireTenant, controller.getById);

export default router;
