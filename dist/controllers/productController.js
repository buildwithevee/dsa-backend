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
exports.searchEmployee = exports.getStats = exports.getProductsBetweenDates = exports.searchProducts = exports.generateQr = exports.deleteProductFromTrash = exports.restoreProduct = exports.deleteProduct = exports.getSingleProduct = exports.productEdit = exports.getRecentProduct = exports.getAllDeletedProducts = exports.getAllProducts = exports.productCreate = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
const qrcode_1 = __importDefault(require("qrcode"));
const employee_1 = require("../utils/employee");
const productCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { DeviceName, Model, SerialNumber, EnrollDate, Compilance, AssignedTo, Employee_ID, warranty, note, branch } = req.body;
    try {
        // Handle warranty: Use null if no warranty date is provided
        const parsedWarranty = warranty ? new Date(warranty) : null;
        if (parsedWarranty && isNaN(parsedWarranty.getTime())) {
            res.status(400).json({ error: 'Invalid warranty date provided' });
            return;
        }
        const product = new productModel_1.default({
            DeviceName,
            Model,
            SerialNumber,
            EnrollDate: EnrollDate || new Date(), // Use current date if not provided
            Compilance: Compilance || false,
            AssignedTo: AssignedTo || '',
            warranty: parsedWarranty, // Null or a valid date
            note: note || "",
            branch: branch || "",
            Employee_ID
        });
        yield product.save();
        res.status(201).json({ product });
    }
    catch (error) {
        console.error('Error adding product', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});
exports.productCreate = productCreate;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
    try {
        const products = yield productModel_1.default.find({
            $or: [
                { isDeleted: false }, // isDeleted is explicitly false
                { isDeleted: { $exists: false } }, // isDeleted field doesn't exist
            ],
        })
            .skip((Number(page) - 1) * Number(limit)) // Skip the records for the current page
            .limit(Number(limit)) // Limit the number of records per page
            .sort({ EnrollDate: -1 }); // Sort by EnrollDate in descending order
        const totalProducts = yield productModel_1.default.countDocuments(); // Count the total number of products
        res.status(200).json({
            success: true,
            data: products,
            total: totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
exports.getAllProducts = getAllProducts;
const getAllDeletedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
    try {
        const products = yield productModel_1.default.find({
            isDeleted: true
        })
            .skip((Number(page) - 1) * Number(limit)) // Skip the records for the current page
            .limit(Number(limit)) // Limit the number of records per page
            .sort({ EnrollDate: -1 }); // Sort by EnrollDate in descending order
        const totalProducts = yield productModel_1.default.countDocuments(); // Count the total number of products
        res.status(200).json({
            success: true,
            data: products,
            total: totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
exports.getAllDeletedProducts = getAllDeletedProducts;
const getRecentProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the most recent product based on EnrollDate or _id (descending order)
        const recentProduct = yield productModel_1.default.find({
            $or: [
                { isDeleted: false }, // isDeleted is explicitly false
                { isDeleted: { $exists: false } }, // isDeleted field doesn't exist
            ],
        }).sort({ EnrollDate: -1 });
        // Check if the product exists
        if (!recentProduct || recentProduct.length === 0) {
            res.status(404).json({ message: "No products found" });
            return;
        }
        // Send the recent product as a response
        // console.log(recentProduct);
        res.status(200).json({ success: true, products: recentProduct });
    }
    catch (error) {
        console.error('Error fetching recent product:', error);
        res.status(500).json({ error: 'Failed to fetch recent product' });
    }
});
exports.getRecentProduct = getRecentProduct;
const productEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract product ID from URL params
    const { DeviceName, Model, SerialNumber, EnrollDate, Compilance, AssignedTo, Employee_ID, warranty, note, branch, } = req.body;
    try {
        // Validate input
        if (!id || !DeviceName || !Model || !SerialNumber || !EnrollDate) {
            res.status(400).json({ error: 'All required fields must be provided' });
            return;
        }
        // Find and update product
        const updatedProduct = yield productModel_1.default.findByIdAndUpdate(id, {
            DeviceName,
            Model,
            SerialNumber,
            EnrollDate,
            Compilance,
            AssignedTo,
            Employee_ID,
            warranty,
            note,
            branch
        }, { new: true } // Return updated document and validate inputs
        );
        if (!updatedProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(422).json({ error: 'Validation error: Invalid data format' });
        }
        else {
            console.error('Error editing product', error);
            res.status(500).json({ error: 'Failed to edit product' });
        }
    }
});
exports.productEdit = productEdit;
// export const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params; // Extract product ID from URL params
//     try {
//         // Find product by ID
//         const product = await Product.findById(id).lean(); // Use `lean` for plain JavaScript object
//         // Check if product exists
//         if (!product) {
//             res.status(404).json({ error: 'Product not found' });
//             return;
//         }
//         // Add warrantyLeft field
//         const currentDate = new Date();
//         const warrantyLeft = product.warranty && product.warranty > currentDate ? "Yes" : "Expired";
//         // Return response with warrantyLeft
//         res.status(200).json({
//             success: true,
//             product: {
//                 ...product,
//                 warrantyLeft,
//             },
//         });
//     } catch (error) {
//         console.error('Error fetching product', error);
//         res.status(500).json({ error: 'Failed to fetch product' });
//     }
// };
const getSingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract product ID from URL params
    try {
        // Find product by ID
        const product = yield productModel_1.default.findById(id).lean(); // Use `lean` for plain JavaScript object
        // Check if product exists
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Add warrantyLeft field
        const currentDate = new Date();
        const warrantyLeft = product.warranty && product.warranty > currentDate ? "Valid" : "Expired";
        // Return response with warrantyLeft
        res.status(200).json({
            success: true,
            product: Object.assign(Object.assign({}, product), { warrantyLeft }),
        });
    }
    catch (error) {
        console.error('Error fetching product', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
exports.getSingleProduct = getSingleProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract product ID from URL params
    try {
        // Find and delete the product by ID
        const deletedProduct = yield productModel_1.default.findByIdAndUpdate(id, {
            $set: { isDeleted: true }
        });
        // Check if product exists and was deleted
        if (!deletedProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Send success response
        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    }
    catch (error) {
        console.error('Error deleting product', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.deleteProduct = deleteProduct;
const restoreProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract product ID from URL params
    try {
        // Find and delete the product by ID
        const restoredProduct = yield productModel_1.default.findByIdAndUpdate(id, {
            $set: { isDeleted: false }
        });
        // Check if product exists and was deleted
        if (!restoredProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Send success response
        res.status(200).json({ message: 'Product restored successfully', product: restoredProduct });
    }
    catch (error) {
        console.error('Error while restoring  product', error);
        res.status(500).json({ error: 'Failed to restore product' });
    }
});
exports.restoreProduct = restoreProduct;
const deleteProductFromTrash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract product ID from URL params
    try {
        // Find and delete the product by ID
        const deletedProduct = yield productModel_1.default.findByIdAndDelete(id);
        // Check if product exists and was deleted
        if (!deletedProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Send success response
        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    }
    catch (error) {
        console.error('Error deleting product', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.deleteProductFromTrash = deleteProductFromTrash;
const generateQr = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
    }
    const url = `http://ec2-43-204-2-117.ap-south-1.compute.amazonaws.com:5000/product/${productId}`;
    try {
        const qrCodeData = yield qrcode_1.default.toDataURL(url);
        res.status(200).json({ qrCodeData });
    }
    catch (error) {
        console.error('QR code generation failed', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});
exports.generateQr = generateQr;
// export const searchProducts = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { page, limit, searchTerm, compilance, assignedTo } = req.query;
//         // Set defaults for pagination
//         const pageNo: number = parseInt(page as string) || 1;
//         const limitOf: number = parseInt(limit as string) || 10;
//         if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
//             res.status(400).json({ message: "Invalid page or limit value", success: false });
//             return;
//         }
//         const skip: number = (pageNo - 1) * limitOf;
//         // Construct the search query
//         let query: any = {};
//         if (searchTerm) {
//             const searchRegex = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
//             query.$or = [
//                 { DeviceName: searchRegex },
//                 { Model: searchRegex },
//                 { SerialNumber: searchRegex },
//                 { AssignedTo: searchRegex },
//             ];
//         }
//         // Filter by Compliance
//         if (compilance !== undefined) {
//             query.Compilance = compilance === 'true';
//         }
//         // Filter by AssignedTo field
//         if (assignedTo) {
//             query.AssignedTo = { $regex: assignedTo, $options: "i" };
//         }
//         // Fetch filtered products with pagination
//         const products = await Product.find(query)
//             .skip(skip)
//             .limit(limitOf)
//             .sort({ EnrollDate: -1 }) // Sort by latest EnrollDate
//             .lean();
//         // Total documents count for the query
//         const totalProducts = await Product.countDocuments(query);
//         const totalPages = Math.ceil(totalProducts / limitOf);
//         // Return response
//         res.status(200).json({
//             success: true,
//             message: "Products fetched successfully",
//             data: products,
//             total: totalProducts,
//             totalPages: totalPages,
//             // currentPage: pageNo,
//         });
//     } catch (error) {
//         console.error('Error searching products:', error);
//         res.status(500).json({ success: false, message: 'Failed to fetch products', error });
//     }
// };
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("entered search");
        const { page, limit, searchTerm, compilance, assignedTo, isDeleted } = req.query;
        console.log("searchTerm", searchTerm);
        console.log("isdeleted", isDeleted);
        // Set defaults for pagination
        const pageNo = parseInt(page) || 1;
        const limitOf = parseInt(limit) || 10;
        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            res.status(400).json({ message: "Invalid page or limit value", success: false });
            return;
        }
        const skip = (pageNo - 1) * limitOf;
        // Construct the search query
        let query = {};
        if (searchTerm) {
            const searchRegex = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
            query.$or = [
                { DeviceName: searchRegex },
                { Model: searchRegex },
                { SerialNumber: searchRegex },
                { AssignedTo: searchRegex },
                { Employee_ID: searchRegex }
            ];
        }
        // Filter by Compliance
        if (compilance !== undefined) {
            query.Compilance = compilance === 'true';
        }
        if (isDeleted !== undefined) {
            query.isDeleted = isDeleted === 'true';
        }
        // Filter by AssignedTo field
        if (assignedTo) {
            query.AssignedTo = { $regex: assignedTo, $options: "i" };
        }
        console.log(query);
        // Fetch filtered products with pagination
        const products = yield productModel_1.default.find(query)
            .skip(skip)
            .limit(limitOf)
            .sort({ EnrollDate: -1 }) // Sort by latest EnrollDate
            .lean();
        // Add warrantyLeft field
        const currentDate = new Date();
        const productsWithWarranty = products.map(product => {
            const warrantyLeft = product.warranty && product.warranty > currentDate ? "Valid" : "Expired";
            return Object.assign(Object.assign({}, product), { warrantyLeft });
        });
        // Total documents count for the query
        const totalProducts = yield productModel_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limitOf);
        // Return response
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: productsWithWarranty,
            total: totalProducts,
            totalPages: totalPages,
        });
    }
    catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error });
    }
});
exports.searchProducts = searchProducts;
const getProductsBetweenDates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, branch, assignedTo } = req.query;
    try {
        // Validate date parameters
        if (!startDate || !endDate) {
            res.status(400).json({ success: false, message: 'Both startDate and endDate are required' });
            return;
        }
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            res.status(400).json({ success: false, message: 'Invalid date format' });
            return;
        }
        // Build the query object
        const query = {
            EnrollDate: {
                $gte: parsedStartDate, // Greater than or equal to startDate
                $lte: parsedEndDate, // Less than or equal to endDate
            },
        };
        if (branch) {
            query.branch = branch; // Add branch filter if provided
        }
        if (assignedTo) {
            query.AssignedTo = assignedTo;
        }
        // Fetch products within the date range and branch
        const products = yield productModel_1.default.find(query)
            .sort({ EnrollDate: -1 })
            .lean(); // Use `lean` for plain JavaScript objects
        // console.log(products);
        // Add warrantyLeft field
        const currentDate = new Date();
        const productsWithWarranty = products.map(product => {
            const warrantyLeft = product.warranty && product.warranty > currentDate ? "Valid" : "Expired";
            return Object.assign(Object.assign({}, product), { warrantyLeft });
        });
        // Count total products in the range
        const totalProducts = yield productModel_1.default.countDocuments(query);
        // Return the result
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: productsWithWarranty,
            total: totalProducts,
        });
    }
    catch (error) {
        console.error('Error fetching products by date range:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error });
    }
});
exports.getProductsBetweenDates = getProductsBetweenDates;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Helper function to get start and end of a day in Saudi Arabia timezone
        const getSaudiDateRange = (offsetHours = 0) => {
            const now = new Date();
            const saudiDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
            saudiDate.setHours(offsetHours, 0, 0, 0); // Adjust to start or end of the day
            return saudiDate;
        };
        // Start and end of today in Saudi Arabia time
        const startOfToday = getSaudiDateRange(0); // Start of the day
        const endOfToday = getSaudiDateRange(23); // End of the day
        // Start and end of the current month in Saudi Arabia time
        const startOfMonth = new Date();
        startOfMonth.setUTCFullYear(startOfToday.getFullYear(), startOfToday.getMonth(), 1); // First day of the month
        startOfMonth.setUTCHours(0, 0, 0, 0);
        const endOfMonth = new Date();
        endOfMonth.setUTCFullYear(startOfToday.getFullYear(), startOfToday.getMonth() + 1, 0); // Last day of the month
        endOfMonth.setUTCHours(23, 59, 59, 999);
        //fetch the total pc count
        const totalPc = yield productModel_1.default.countDocuments({});
        // Fetch the total PC count for today
        const totalPCToday = yield productModel_1.default.countDocuments({
            EnrollDate: { $gte: startOfToday, $lte: endOfToday }
        });
        // Fetch the total PC count for this month
        const totalPCThisMonth = yield productModel_1.default.countDocuments({
            EnrollDate: { $gte: startOfMonth, $lte: endOfMonth }
        });
        // Send response
        res.status(200).json({
            success: true,
            data: {
                totalPc,
                totalPCThisMonth,
                totalPCToday
            }
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats', error });
    }
});
exports.getStats = getStats;
const searchEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.query;
        let query = {};
        if (searchTerm) {
            const searchRegex = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
            query.$or = [
                { Emp_ID: searchRegex },
                { Emlpoyee_Name: searchRegex },
            ];
        }
        const employees = yield employee_1.Employee.find(query)
            .limit(6)
            .lean();
        res.status(200).json({ message: "fetched sucess", success: true, employees });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch employes', error });
    }
});
exports.searchEmployee = searchEmployee;
