import { Router } from "express";
import productsRouter from "../modules/products/products.routes.js";
const router = Router();
// router.use('/invoices', invoicesRouter);
router.use("/products", productsRouter);
// ...other modules
export default router;
//# sourceMappingURL=index.js.map