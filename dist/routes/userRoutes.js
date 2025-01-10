"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const atuhController_1 = require("../controllers/atuhController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
// User Registration
router.post('/register', atuhController_1.userRegister);
// User Login
router.post('/login', atuhController_1.userLogin);
router.route("/update-password").post(authMiddleware_1.default, atuhController_1.updatePassword);
router.route("/send-otp").post(atuhController_1.forgotPassword);
router.route("/verify-otp").post(atuhController_1.verifyOTP);
router.route("/reset-password").post(atuhController_1.resetPassword);
router.route("/get-user-details").get(authMiddleware_1.default, atuhController_1.getDetailsOfAUser);
router.route("/update-user-details").post(authMiddleware_1.default, atuhController_1.sendOtpToCurrentEmail);
router.route("/verify-otp-user-details").post(authMiddleware_1.default, atuhController_1.verifyOtpFromCurrentEmail);
// User Logout (client-side token removal)
router.post('/logout', atuhController_1.userLogout);
exports.default = router;
