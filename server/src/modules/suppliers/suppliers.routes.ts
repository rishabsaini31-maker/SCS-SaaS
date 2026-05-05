import { Router } from "express";
import * as controller from "./suppliers.controller";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.get("/:id/ledger", controller.getLedger);
router.patch("/:id", controller.update);
router.delete("/:id", controller.deleteSupplier);

export default router;
