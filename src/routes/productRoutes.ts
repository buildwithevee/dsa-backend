import { Router } from "express";
import { deleteProduct, generateQr, getAllProducts, getRecentProduct, getSingleProduct, productCreate, productEdit, searchProducts } from "../controllers/productController";

const router = Router();

//crud
router.route("/create").post(productCreate);
router.route("/get-products").get(getAllProducts);
router.route("/get-recent").get(getRecentProduct);
router.route('/edit-product/:id').put(productEdit);
router.get('/each/:id', getSingleProduct);
router.delete('/each/:id', deleteProduct);

//qr related
router.post("/generate", generateQr);

router.route("/search").get(searchProducts);

export default router;