import { Router } from "express";
import * as controller from "./settings.controller";

const router = Router();

router.get("/", controller.get);
router.get("/business-profile", controller.businessProfile);
router.patch("/", controller.update);

export default router;
