import { Router } from "express";
import * as controller from "./scs-admin.controller";
import {
  authenticateSuperAdmin,
  requireSuperAdmin,
} from "../../common/middlewares/superAdminAuth";

const router = Router();

router.use(authenticateSuperAdmin, requireSuperAdmin);

router.get("/dashboard", controller.dashboard);
router.get("/tenants", controller.list);
router.post("/shops", controller.createShop);
router.patch("/tenants/:tenantId/status", controller.updateStatus);
router.post(
  "/tenants/:tenantId/reset-owner-password",
  controller.resetOwnerPassword,
);

export default router;
