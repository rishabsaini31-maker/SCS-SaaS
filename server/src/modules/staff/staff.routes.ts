import { Router } from "express";
import * as controller from "./staff.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";
import { requireOwner } from "../../common/middlewares/requireRole";

const router = Router();

// Only OWNER can manage staff
router.use(authenticateJWT, requireTenant, requireOwner);

router.get("/", controller.getStaffList);
router.post("/", controller.createStaff);
router.get("/metrics", controller.getStaffMetrics);
router.get("/performance", controller.getStaffPerformance);

router.put("/:id", controller.updateStaff);
router.delete("/:id", controller.deleteStaff);
router.post("/:id/reset-password", controller.resetPassword);
router.put("/:id/toggle-status", controller.toggleStatus);

export default router;
