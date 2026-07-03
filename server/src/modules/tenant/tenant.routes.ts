import { Router } from "express";
import * as controller from "./tenant.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { tenantIdSchema } from "./tenant.schema";

const router = Router();

router.get("/", authenticateJWT, requireTenant, controller.list);
router.get("/:id", authenticateJWT, requireTenant, validateRequest({ params: tenantIdSchema }), controller.getById);

export default router;
