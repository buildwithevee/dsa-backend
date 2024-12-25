import { Router } from "express";
import { getProductsBetweenDates } from "../controllers/productController";

const router = Router();

//crud
router.route("/get-between").get(getProductsBetweenDates);



export default router;