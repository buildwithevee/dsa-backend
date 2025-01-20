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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./conf/db");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const ReportRoutes_1 = __importDefault(require("./routes/ReportRoutes"));
const node_cron_1 = __importDefault(require("node-cron"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const employee_1 = require("./utils/employee");
// Initialize Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static('/var/www/evee/dsa/dsa-frontend/dist'));
app.get("/hi", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, employee_1.fetchAndStoreEmployees)();
    res.status(200).json({ mess: "kazhinju" });
}));
// Cron job to update data daily 
node_cron_1.default.schedule('0 0 * * *', () => {
    const currentTimeInRiyadh = (0, moment_timezone_1.default)().tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    console.log(`Cron job executed at 12:00 AM Saudi time: ${currentTimeInRiyadh}`);
    // Your task logic here
    (0, employee_1.fetchAndStoreEmployees)();
}, {
    timezone: "Asia/Riyadh" // Ensures the cron runs based on Saudi timezone
});
//routes
app.use("/api/product", productRoutes_1.default);
app.use("/api/auth", userRoutes_1.default);
app.use("/api/reports", ReportRoutes_1.default);
app.get("*", (req, res) => {
    res.sendFile('/var/www/evee/dsa/dsa-frontend/dist/index.html');
});
// Start server with db connection
(0, db_1.connectDb)().then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
});
