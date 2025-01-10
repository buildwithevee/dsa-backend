"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
//crud
router.route("/create").post(productController_1.productCreate);
router.route("/get-products").get(productController_1.getAllProducts);
router.route("/get-recent").get(productController_1.getRecentProduct);
router.route('/edit-product/:id').put(productController_1.productEdit);
router.get('/each/:id', productController_1.getSingleProduct);
router.delete('/each/:id', productController_1.deleteProduct);
//qr related
router.post("/generate", productController_1.generateQr);
router.route("/search").get(productController_1.searchProducts);
router.route("/stats").get(productController_1.getStats);
router.route("/search-employee").get(productController_1.searchEmployee);
exports.default = router;
