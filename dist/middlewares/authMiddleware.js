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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const SECRET_KEY = "secret_mosh_evee"; // Replace with your actual secret key
// Middleware function to verify the JWT token
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    // console.log(authHeader);
    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!token) {
        res.status(401).json({ message: 'Token missing' });
        return;
    }
    try {
        // Verify the token using JWT
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY); // Type assertion to ensure we have the 'id' field in decoded object
        // Find user by decoded id
        const user = yield userModel_1.default.findById(decoded.id).select("_id email userName profilePicture");
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Attach the user to the request object so that it's available in the route handlers
        req.user = {
            email: user.email,
            userId: user._id, // Ensure this is ObjectId
            username: user.username,
        };
        next(); // Proceed to the next middleware/handler
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authenticated, token failed' });
        return;
    }
});
exports.default = protect;
