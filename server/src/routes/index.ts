import { Router } from "express";
// import sub-routes here

const router = Router();

// router.use('/invoices', invoicesRouter);
import productsRouter from "../modules/products/products.routes";
router.use("/products", productsRouter);
// ...other modules

export default router;
