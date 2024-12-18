import express from 'express';
import cors from 'cors';
import { connectDb } from './conf/db';
import productRouter from './routes/productRoutes';
import authRouter from './routes/userRoutes';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

//routes
app.use("/api/product", productRouter);
app.use("/api/auth", authRouter);
app.get("*", (req, res) => {
    res.sendFile('/var/www/evee/dsa/dsa-frontend/dist/index.html');
});
// Start server with db connection
connectDb().then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
});
