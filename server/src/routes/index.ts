import { Router } from "express";
import invoicesRouter from "./invoices";

const router = Router();

router.use("/invoices", invoicesRouter);

export default router;
