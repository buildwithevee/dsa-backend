import express from 'express';
import cors from 'cors';
import { connectDb } from './conf/db';
import productRouter from './routes/productRoutes';
import authRouter from './routes/userRoutes';
import reportRouter from './routes/ReportRoutes';
import cron from 'node-cron';
import moment from 'moment-timezone';
import { fetchAndStoreEmployees } from './utils/employee';
// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('/var/www/evee/dsa/dsa-frontend/dist'));

app.get("/hi", async (req, res) => {
    await fetchAndStoreEmployees();
    res.status(200).json({ mess: "kazhinju" })

})
// Cron job to update data daily 
cron.schedule('0 0 * * *', () => {
    const currentTimeInRiyadh = moment().tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    console.log(`Cron job executed at 12:00 AM Saudi time: ${currentTimeInRiyadh}`);

    // Your task logic here
    fetchAndStoreEmployees();
}, {
    timezone: "Asia/Riyadh" // Ensures the cron runs based on Saudi timezone
});

//routes
app.use("/api/product", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/reports", reportRouter);
app.get("*", (req, res) => {
    res.sendFile('/var/www/evee/dsa/dsa-frontend/dist/index.html');
});

// Start server with db connection
connectDb().then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
});
