import { Router } from "express";
import * as controller from "./invoices.controller";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/customer/:customerId", controller.listByCustomer);
router.get("/:id", controller.getById);

export default router;
