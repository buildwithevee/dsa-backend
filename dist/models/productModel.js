"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    DeviceName: {
        type: String,
        required: true
    },
    Model: {
        type: String,
        required: true
    },
    SerialNumber: {
        type: String,
        required: true
    },
    EnrollDate: {
        type: Date,
        default: Date.now, // Set a default value
    },
    Compilance: {
        type: Boolean,
        default: false,
    },
    AssignedTo: {
        type: String,
    },
    Employee_ID: {
        type: String,
    },
    warranty: {
        type: Date,
        default: null
    },
    note: {
        type: String,
    },
    branch: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
productSchema.index({ SerialNumber: 1 });
productSchema.index({ branch: 1 });
productSchema.index({ isDeleted: 1 });
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
