import express from 'express';
import { confirmAccess, forgotPassword, getDetailsOfAUser, resetPassword, sendOtpToCurrentEmail, trashAccess, updateDetailsOfAUser, updatePassword, userLogin, userLogout, userRegister, verifyOTP, verifyOtpFromCurrentEmail } from '../controllers/atuhController';
import protect from '../middlewares/authMiddleware';

const router = express.Router();

// User Registration
router.post('/register', userRegister);

// User Login
router.post('/login', userLogin);

router.route("/update-password").post(protect, updatePassword);


router.route("/send-otp").post(forgotPassword);
router.route("/verify-otp").post(verifyOTP);
router.route("/reset-password").post(resetPassword)




router.route("/get-user-details").get(protect, getDetailsOfAUser);
router.route("/update-user-details").post(protect, sendOtpToCurrentEmail);
router.route("/verify-otp-user-details").post(protect, verifyOtpFromCurrentEmail);

//trash
router.route("/trash-access-otp").post(trashAccess);
router.route("/trash-access-verification").post(confirmAccess);


// User Logout (client-side token removal)
router.post('/logout', userLogout);

export default router;
