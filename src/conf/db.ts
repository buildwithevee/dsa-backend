import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
    try {
        await mongoose.connect('mongodb://localhost:27017/stock-management');
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed', error);
        process.exit(1);
    }
};

export { connectDb }