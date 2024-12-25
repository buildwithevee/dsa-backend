import { Request, Response } from "express";
import Product from "../models/productModel";
import QRCode from 'qrcode';

export const productCreate = async (req: Request, res: Response): Promise<void> => {
    const {
        DeviceName,
        Model,
        SerialNumber,
        EnrollDate,
        Compilance,
        AssignedTo,
        warranty,
        note
    } = req.body;

    try {
        const product = new Product({
            DeviceName,
            Model,
            SerialNumber,
            EnrollDate: EnrollDate || new Date(), // Use current date if not provided
            Compilance: Compilance || false,
            AssignedTo: AssignedTo || '',
            warranty: warranty || false,
            note: note || ""
        });

        await product.save();
        res.status(201).json({ product });
    } catch (error) {
        console.error('Error adding product', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

    try {
        const products = await Product.find()
            .skip((Number(page) - 1) * Number(limit)) // Skip the records for the current page
            .limit(Number(limit)) // Limit the number of records per page
            .sort({ EnrollDate: -1 }); // Sort by EnrollDate in descending order

        const totalProducts = await Product.countDocuments(); // Count the total number of products

        res.status(200).json({
            success: true,
            data: products,
            total: totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};


export const getRecentProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch the most recent product based on EnrollDate or _id (descending order)
        const recentProduct = await Product.find().sort({ createdAt: -1 });

        // Check if the product exists
        if (!recentProduct || recentProduct.length === 0) {
            res.status(404).json({ message: "No products found" });
            return;
        }

        // Send the recent product as a response
        res.status(200).json({ success: true, products: recentProduct });
    } catch (error) {
        console.error('Error fetching recent product:', error);
        res.status(500).json({ error: 'Failed to fetch recent product' });
    }
};


export const productEdit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract product ID from URL params
    const {
        DeviceName,
        Model,
        SerialNumber,
        EnrollDate,
        Compilance,
        AssignedTo,
        warranty,
        note
    } = req.body;

    try {
        // Validate input
        if (!id || !DeviceName || !Model || !SerialNumber || !EnrollDate) {
            res.status(400).json({ error: 'All required fields must be provided' });
            return;
        }

        // Find and update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                DeviceName,
                Model,
                SerialNumber,
                EnrollDate,
                Compilance,
                AssignedTo,
                warranty,
                note
            },
            { new: true } // Return updated document and validate inputs
        );

        if (!updatedProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(422).json({ error: 'Validation error: Invalid data format' });
        } else {
            console.error('Error editing product', error);
            res.status(500).json({ error: 'Failed to edit product' });
        }
    }
};


export const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract product ID from URL params

    try {
        // Find product by ID
        const product = await Product.findById(id);

        // Check if product exists
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        // Send product data as response
        res.status(200).json({ product });
    } catch (error) {
        console.error('Error fetching product', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};


export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract product ID from URL params

    try {
        // Find and delete the product by ID
        const deletedProduct = await Product.findByIdAndDelete(id);

        // Check if product exists and was deleted
        if (!deletedProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        // Send success response
        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error('Error deleting product', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

export const generateQr = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.body;

    if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
    }

    const url = `http://192.168.29.227:5173/product/${productId}`;
    try {
        const qrCodeData = await QRCode.toDataURL(url);
        res.status(200).json({ qrCodeData });
    } catch (error) {
        console.error('QR code generation failed', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
};



export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, searchTerm, compilance, assignedTo } = req.query;

        // Set defaults for pagination
        const pageNo: number = parseInt(page as string) || 1;
        const limitOf: number = parseInt(limit as string) || 10;

        if (isNaN(pageNo) || isNaN(limitOf) || pageNo < 1 || limitOf < 1) {
            res.status(400).json({ message: "Invalid page or limit value", success: false });
            return;
        }

        const skip: number = (pageNo - 1) * limitOf;

        // Construct the search query
        let query: any = {};

        if (searchTerm) {
            const searchRegex = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
            query.$or = [
                { DeviceName: searchRegex },
                { Model: searchRegex },
                { SerialNumber: searchRegex },
                { AssignedTo: searchRegex },
            ];
        }

        // Filter by Compliance
        if (compilance !== undefined) {
            query.Compilance = compilance === 'true';
        }

        // Filter by AssignedTo field
        if (assignedTo) {
            query.AssignedTo = { $regex: assignedTo, $options: "i" };
        }

        // Fetch filtered products with pagination
        const products = await Product.find(query)
            .skip(skip)
            .limit(limitOf)
            .sort({ EnrollDate: -1 }) // Sort by latest EnrollDate
            .lean();

        // Total documents count for the query
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limitOf);

        // Return response
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            total: totalProducts,
            totalPages: totalPages,
            // currentPage: pageNo,
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error });
    }
};

export const getProductsBetweenDates = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    try {
        // Validate date parameters
        if (!startDate || !endDate) {
            res.status(400).json({ success: false, message: 'Both startDate and endDate are required' });
            return;
        }

        const parsedStartDate = new Date(startDate as string);
        const parsedEndDate = new Date(endDate as string);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            res.status(400).json({ success: false, message: 'Invalid date format' });
            return;
        }

        // Pagination setup


        // Fetch products within the date range
        const products = await Product.find({
            EnrollDate: {
                $gte: parsedStartDate, // Greater than or equal to startDate
                $lte: parsedEndDate,  // Less than or equal to endDate
            },
        })
            .sort({ EnrollDate: -1 });

        // Count total products in the range
        const totalProducts = await Product.countDocuments({
            EnrollDate: {
                $gte: parsedStartDate,
                $lte: parsedEndDate,
            },
        });

        // Return the result
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
            total: totalProducts,
        });
    } catch (error) {
        console.error('Error fetching products by date range:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error });
    }
};
