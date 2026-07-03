import { Router } from "express";
import * as controller from "./settings.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { updateTenantSettingsSchema } from "./settings.schema";

const router = Router();

router.get("/", searchRateLimiter, controller.get);
router.get("/business-profile", searchRateLimiter, controller.businessProfile);
router.patch("/", validateRequest({ body: updateTenantSettingsSchema }), controller.update);

export default router;
