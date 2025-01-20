import { Router } from "express";
import { deleteProduct, deleteProductFromTrash, generateQr, getAllDeletedProducts, getAllProducts, getRecentProduct, getSingleProduct, getStats, productCreate, productEdit, restoreProduct, searchEmployee, searchProducts } from "../controllers/productController";

const router = Router();

//crud
router.route("/create").post(productCreate);
router.route("/get-products").get(getAllProducts);
router.route("/get-deleted-products").get(getAllDeletedProducts);
router.route("/get-recent").get(getRecentProduct);
router.route('/edit-product/:id').put(productEdit);
router.get('/each/:id', getSingleProduct);
router.delete('/each/:id', deleteProduct);
router.patch('/each/:id', restoreProduct);
router.delete('/each/trash/:id', deleteProductFromTrash);

//qr related
router.post("/generate", generateQr);

router.route("/search").get(searchProducts);

router.route("/stats").get(getStats);

router.route("/search-employee").get(searchEmployee);

export default router;