import { Router } from "express";
import * as controller from "./products.controller";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.getProducts);
router.get("/suggest", controller.suggest);
router.get("/low-stock", controller.getLowStock);
router.post("/:id/activate", controller.activate);
router.get("/:id", controller.getById);
router.patch("/:id", controller.update);
router.delete("/:id", controller.deleteProduct);

export default router;
