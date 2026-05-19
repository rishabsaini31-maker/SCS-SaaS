import { Router } from "express";
import * as controller from "./scs-auth.controller";
import {
  authenticateSuperAdmin,
  requireSuperAdmin,
} from "../../common/middlewares/superAdminAuth";

const router = Router();

router.post("/login", controller.login);
router.get("/me", authenticateSuperAdmin, requireSuperAdmin, controller.me);

export default router;
