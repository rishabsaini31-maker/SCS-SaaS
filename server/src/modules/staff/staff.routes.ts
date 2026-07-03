import { Router } from "express";
import * as controller from "./staff.controller";
import { authenticateJWT } from "../../common/middlewares/auth";
import requireTenant from "../../common/middlewares/requireTenant";
import { requireOwner } from "../../common/middlewares/requireRole";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { createStaffSchema, resetPasswordSchema, toggleStatusSchema, updateStaffSchema } from "./staff.schema";
import { z } from "zod";

const staffIdSchema = z.object({
	id: z.string().min(1, "Staff ID is required"),
});

const router = Router();

// Only OWNER can manage staff
router.use(authenticateJWT, requireTenant, requireOwner);

router.get("/", searchRateLimiter, controller.getStaffList);
router.post("/", validateRequest({ body: createStaffSchema }), controller.createStaff);
router.get("/metrics", searchRateLimiter, controller.getStaffMetrics);
router.get("/performance", searchRateLimiter, controller.getStaffPerformance);

router.put("/:id", validateRequest({ params: staffIdSchema, body: updateStaffSchema }), controller.updateStaff);
router.delete("/:id", validateRequest({ params: staffIdSchema }), controller.deleteStaff);
router.post("/:id/reset-password", validateRequest({ params: staffIdSchema, body: resetPasswordSchema }), controller.resetPassword);
router.put("/:id/toggle-status", validateRequest({ params: staffIdSchema, body: toggleStatusSchema }), controller.toggleStatus);

export default router;
