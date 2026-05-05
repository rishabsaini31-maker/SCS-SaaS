import { ProductsService } from "./products.service.js";
export class ProductsController {
    static async getAll(req, res, next) {
        try {
            const products = await ProductsService.getAll();
            res.json(products);
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=products.controller.js.map