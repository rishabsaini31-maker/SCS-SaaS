import { Router } from "express";
import * as controller from "./categories.controller";

const router = Router();

router.get("/", controller.getCategories);
router.post("/", controller.createCategory);
router.delete("/:name", controller.deleteCategory);

export default router;
