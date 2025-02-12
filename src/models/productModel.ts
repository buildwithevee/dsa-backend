import mongoose from "mongoose";

interface IProduct extends mongoose.Document {
    DeviceName: string;
    Model: string;
    SerialNumber: string;
    EnrollDate: Date;
    Compilance: boolean;
    AssignedTo: string;
    Employee_ID: string;
    warranty: Date | null;
    isDeleted: boolean;
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
    Employee_ID:{
        type:String,
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

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;