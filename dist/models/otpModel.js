"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    otp: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    type: {
        type: String,
        enum: ["forgot", "trash-access"]
    }
}, { timestamps: true });
const OtpModel = mongoose_1.default.model("Otp", otpSchema);
exports.default = OtpModel;
