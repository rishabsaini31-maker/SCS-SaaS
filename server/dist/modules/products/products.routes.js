import { Router } from "express";
import { ProductsController } from "./products.controller.js";
const router = Router();
router.get("/", ProductsController.getAll);
export default router;
//# sourceMappingURL=products.routes.js.map