import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { sendOtpEmail } from '../utils/sendMail';
import { generateOTP } from '../utils/generateOTP';
import OtpModel, { IOtp } from '../models/otpModel';

const JWT_SECRET = 'secret_mosh_evee'; // Use a secure key in production
const TOKEN_EXPIRY = '100d'; // Token expiry time

// User Login
export const userLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRY,
        });

        // Respond with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// User Logout (Client-side Token Management)
export const userLogout = (req: Request, res: Response): void => {
    res.status(200).json({ message: 'Logout successful' });
};

// User Registration (Optional)
export const userRegister = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};




export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Find the user by ID
        const userId = req.user?.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify the current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};

// Forgot Password - Send Verification Email
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await OtpModel.deleteMany({ userId: user._id })
        const otp = generateOTP();
        const otpData: IOtp = await OtpModel.create({
            otp: otp,
            userId: user?._id
        });
        // Configure nodemailer transport
        const emailsent = await sendOtpEmail(email, otp);

        if (otp) {
            res.status(201).json({ message: 'We have sent an email to you preffered mail inorder to verify it is you', user: user });
            return;
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json({ message: 'Password reset token sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send password reset token' });
    }
};

// Reset Password
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { userId, otp } = req.body;
    try {
        // Verify the reset token
        const storedOtp = await OtpModel.findOne({ userId })
        if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.otpExpiry.getTime()) {
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }
        await OtpModel.deleteMany({ userId });
        res.status(200).json({ message: "process to next step" })
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};



export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { userId, newPassword } = req.body;
    try {
        // Verify the reset token
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateUser = await User.findByIdAndUpdate(userId, {
            password: hashedPassword,
        })
        res.status(200).json({ message: "password updated successfully" })
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};


export const getDetailsOfAUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId).select("_id email username");

        res.status(200).json({ message: "success", success: true, user })
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}


export const updateDetailsOfAUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { username, email } = req.body;
        const user = await User.findByIdAndUpdate(userId, { username, email }, { new: true });
        res.status(200).json({ message: "success", success: true, user })
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}




export const sendOtpToCurrentEmail = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { username, email } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        await OtpModel.deleteMany({ userId: user._id })
        const otp = generateOTP(); // Generate OTP
        await OtpModel.create({ otp, userId, username, email });
        console.log("sending");

        await sendOtpEmail(user.email, otp); // Send OTP to current email

        res.status(200).json({ message: 'Authorization OTP sent to current email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const verifyOtpFromCurrentEmail = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { otp } = req.body;

    try {
        const otpRecord = await OtpModel.findOne({ userId });
        if (!otpRecord || otpRecord.otp !== otp) {
            res.status(400).json({ error: 'Invalid or expired OTP.' });
            return;
        }
        await User.findByIdAndUpdate(userId, {
            username: otpRecord.username,
            email: otpRecord.email
        })

        await OtpModel.deleteMany({ userId }); // Clear OTP after verification

        res.status(200).json({ message: 'Current email verified. Proceed to update.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const trashAccess = async (req: Request, res: Response): Promise<void> => {


    try {
        // Check if the user exists
        const users = await User.find().limit(1);
        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const user = users[0];
        await OtpModel.deleteMany({ userId: user._id })
        const otp = generateOTP();
        const otpData: IOtp = await OtpModel.create({
            otp: otp,
            userId: user?._id,
            type: "trash-access"
        });
        // Configure nodemailer transport
        const emailsent = await sendOtpEmail(user.email, otp);

        if (otp) {
            res.status(201).json({ message: 'We have sent an email to you preffered mail inorder to verify it is you', user: user });
            return;
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }


    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send password reset token' });
    }
};

// Reset Password
export const confirmAccess = async (req: Request, res: Response): Promise<void> => {
    const { otp } = req.body;
    try {
        const users = await User.find().limit(1);
        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const user = users[0];
        const storedOtp = await OtpModel.findOne({ userId: user._id, type: "trash-access" })
        if (!storedOtp || storedOtp.otp !== otp) {
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }
        await OtpModel.deleteMany({ userId: user._id });
        res.status(200).json({ message: "process to next step" })
    } catch (error) {
        console.error('trash access error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
