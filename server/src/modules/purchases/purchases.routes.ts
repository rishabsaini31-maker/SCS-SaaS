import { Router } from "express";
import * as controller from "./purchases.controller";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);

export default router;
