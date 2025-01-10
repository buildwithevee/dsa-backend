"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
//crud
router.route("/get-between").get(productController_1.getProductsBetweenDates);
exports.default = router;
