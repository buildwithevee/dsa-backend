import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
import { Document } from "mongoose";

export interface IOtp extends Document {
    otp: string;
    username: string;
    email: string;
    userId: Types.ObjectId;
    otpExpiry: Date;
}
const otpSchema: Schema<IOtp> = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
    },
    email: {
        type: String,

    }

}, { timestamps: true })

const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);
export default OtpModel;