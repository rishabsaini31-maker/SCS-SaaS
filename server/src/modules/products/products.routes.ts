import { Router } from "express";
import * as productsController from "./products.controller";

const router = Router();

router.get("/", productsController.getProducts);

export default router;
