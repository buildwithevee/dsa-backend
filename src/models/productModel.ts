import mongoose from "mongoose";

interface IProduct extends mongoose.Document {
    DeviceName: string;
    Model: string;
    SerialNumber: string;
    EnrollDate: Date;
    Compilance: boolean;
    AssignedTo: string;
    warranty: Date;
    note: string;
    branch: string;
}

const productSchema = new mongoose.Schema<IProduct>({
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
    warranty: {
        type: Date,

    },
    note: {
        type: String,
    },
    branch: {
        type: String,
    }
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;