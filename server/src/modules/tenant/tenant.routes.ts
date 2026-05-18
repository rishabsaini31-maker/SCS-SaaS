import { Router } from "express";
import * as controller from "./tenant.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";

const router = Router();

// Public endpoints
router.post("/", controller.create);
router.get("/", authenticateJWT, requireTenant, controller.list);
router.get("/:id", authenticateJWT, requireTenant, controller.getById);

export default router;
