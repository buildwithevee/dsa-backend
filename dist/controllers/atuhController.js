"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpFromCurrentEmail = exports.sendOtpToCurrentEmail = exports.updateDetailsOfAUser = exports.getDetailsOfAUser = exports.resetPassword = exports.verifyOTP = exports.forgotPassword = exports.updatePassword = exports.userRegister = exports.userLogout = exports.userLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const sendMail_1 = require("../utils/sendMail");
const generateOTP_1 = require("../utils/generateOTP");
const otpModel_1 = __importDefault(require("../models/otpModel"));
const JWT_SECRET = 'secret_mosh_evee'; // Use a secure key in production
const TOKEN_EXPIRY = '100d'; // Token expiry time
// User Login
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRY,
        });
        // Respond with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.userLogin = userLogin;
// User Logout (Client-side Token Management)
const userLogout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};
exports.userLogout = userLogout;
// User Registration (Optional)
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        const newUser = new userModel_1.default({
            username,
            email,
            password: hashedPassword,
        });
        yield newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
exports.userRegister = userRegister;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { currentPassword, newPassword } = req.body;
    try {
        // Find the user by ID
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Verify the current password
        const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the user's password
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});
exports.updatePassword = updatePassword;
// Forgot Password - Send Verification Email
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if the user exists
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        yield otpModel_1.default.deleteMany({ userId: user._id });
        const otp = (0, generateOTP_1.generateOTP)();
        const otpData = yield otpModel_1.default.create({
            otp: otp,
            userId: user === null || user === void 0 ? void 0 : user._id
        });
        // Configure nodemailer transport
        const emailsent = yield (0, sendMail_1.sendOtpEmail)(email, otp);
        if (otp) {
            res.status(201).json({ message: 'We have sent an email to you preffered mail inorder to verify it is you', user: user });
            return;
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ message: 'Password reset token sent to email' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send password reset token' });
    }
});
exports.forgotPassword = forgotPassword;
// Reset Password
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, otp } = req.body;
    try {
        // Verify the reset token
        const storedOtp = yield otpModel_1.default.findOne({ userId });
        if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.otpExpiry.getTime()) {
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }
        yield otpModel_1.default.deleteMany({ userId });
        res.status(200).json({ message: "process to next step" });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});
exports.verifyOTP = verifyOTP;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newPassword } = req.body;
    try {
        // Verify the reset token
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const updateUser = yield userModel_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
        });
        res.status(200).json({ message: "password updated successfully" });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});
exports.resetPassword = resetPassword;
const getDetailsOfAUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const user = yield userModel_1.default.findById(userId).select("_id email username");
        res.status(200).json({ message: "success", success: true, user });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.getDetailsOfAUser = getDetailsOfAUser;
const updateDetailsOfAUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { username, email } = req.body;
        const user = yield userModel_1.default.findByIdAndUpdate(userId, { username, email }, { new: true });
        res.status(200).json({ message: "success", success: true, user });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.updateDetailsOfAUser = updateDetailsOfAUser;
const sendOtpToCurrentEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { username, email } = req.body;
    try {
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        yield otpModel_1.default.deleteMany({ userId: user._id });
        const otp = (0, generateOTP_1.generateOTP)(); // Generate OTP
        yield otpModel_1.default.create({ otp, userId, username, email });
        console.log("sending");
        yield (0, sendMail_1.sendOtpEmail)(user.email, otp); // Send OTP to current email
        res.status(200).json({ message: 'Authorization OTP sent to current email.' });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.sendOtpToCurrentEmail = sendOtpToCurrentEmail;
const verifyOtpFromCurrentEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { otp } = req.body;
    try {
        const otpRecord = yield otpModel_1.default.findOne({ userId });
        if (!otpRecord || otpRecord.otp !== otp) {
            res.status(400).json({ error: 'Invalid or expired OTP.' });
            return;
        }
        yield userModel_1.default.findByIdAndUpdate(userId, {
            username: otpRecord.username,
            email: otpRecord.email
        });
        yield otpModel_1.default.deleteMany({ userId }); // Clear OTP after verification
        res.status(200).json({ message: 'Current email verified. Proceed to update.' });
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.verifyOtpFromCurrentEmail = verifyOtpFromCurrentEmail;
