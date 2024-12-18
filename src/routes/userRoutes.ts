import express from 'express';
import { userLogin, userLogout, userRegister } from '../controllers/atuhController';

const router = express.Router();

// User Registration
router.post('/register', userRegister);

// User Login
router.post('/login', userLogin);

// User Logout (client-side token removal)
router.post('/logout', userLogout);

export default router;
