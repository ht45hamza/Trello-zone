import { Request, Response } from 'express';
import User from '../models/UserModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { uploadOnCloudinary } from '../utils/Cloudinary';

export interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

//  Token Generators 
const generateAccessToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
        expiresIn: '7d',
    });
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register 
export const registerUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { full_name, email, password, phone_number, address } = req.body;

    if ([full_name, email, password, phone_number].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Full name, email, password, and phone number are required");
    }

    // Check if avatar is uploaded
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Profile image (avatar) is required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User with this email already exists");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Failed to upload profile image");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        full_name,
        email,
        password: hashedPassword,
        avatar: avatar.url,
        phone_number,
        address: address || "",
    });

    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[AUTH] User registered: ${user.email}`);

    return res.status(201).json(
        new ApiResponse(201, {
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                avatar: user.avatar,
                phone_number: user.phone_number,
                address: user.address,
            },
            accessToken,
            refreshToken,
            token: accessToken,
        }, "User registered successfully")
    );
});

// Login 
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[AUTH] User logged in: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, {
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                avatar: user.avatar,
                phone_number: user.phone_number,
                address: user.address,
            },
            accessToken,
            refreshToken,
            token: accessToken,
        }, "Login successful")
    );
});

//  Refresh Token 
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    // Verify refresh token
    let decoded: any;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Find user and check if the refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token is invalid or has been revoked");
    }

    // Generate new token pair
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Rotate refresh token (invalidate old one)
    user.refreshToken = newRefreshToken;
    await user.save();

    console.log(`[AUTH] Token refreshed for: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            token: newAccessToken,
        }, "Token refreshed successfully")
    );
});

// ─── Logout ──────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Invalidate refresh token
    user.refreshToken = '';
    await user.save();

    console.log(`[AUTH] User logged out: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
});

// Get User Profile
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken -otp -otpExpiry");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

//  Update User Avatar 
export const updateAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar to Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken -otp -otpExpiry");

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    );
});

// ─── Forgot Password (Send OTP) ─────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "No account found with this email");
    }

    // Generate OTP and hash it before storing
    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Store hashed OTP with 10 minute expiry
    user.otp = hashedOTP;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // In production, you would send this via email (Nodemailer, SendGrid, etc.)
    // For development, we log it to the console
    console.log(`\n\x1b[33m╔══════════════════════════════════════╗\x1b[0m`);
    console.log(`\x1b[33m║  OTP for ${user.email}\x1b[0m`);
    console.log(`\x1b[33m║  Code: \x1b[1m\x1b[32m${otp}\x1b[0m`);
    console.log(`\x1b[33m║  Expires in 10 minutes\x1b[0m`);
    console.log(`\x1b[33m╚══════════════════════════════════════╝\x1b[0m\n`);

    return res.status(200).json(
        new ApiResponse(200, { email: user.email }, "OTP sent successfully. Check your email (or server console in dev mode).")
    );
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if OTP has expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
        // Clear expired OTP
        user.otp = '';
        user.otpExpiry = null;
        await user.save();
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // Verify OTP using bcrypt compare
    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    // Generate a short-lived reset token (5 minutes)
    const resetToken = jwt.sign(
        { id: user._id.toString(), purpose: 'password-reset' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '5m' }
    );

    // Clear OTP after successful verification
    user.otp = '';
    user.otpExpiry = null;
    await user.save();

    console.log(`[AUTH] OTP verified for: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, { resetToken, email: user.email }, "OTP verified successfully. Use the reset token to set a new password.")
    );
});

//Reset Password (after OTP verification) 
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        throw new ApiError(400, "Reset token and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Verify reset token
    let decoded: any;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');
    } catch (err) {
        throw new ApiError(401, "Reset token is invalid or has expired. Please request a new OTP.");
    }

    if (decoded.purpose !== 'password-reset') {
        throw new ApiError(401, "Invalid reset token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`[AUTH] Password reset for: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully. You can now login with your new password.")
    );
});

// (Change Password (while logged in) 
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`[AUTH] Password changed for: ${user.email}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Search Users by Email 
export const searchUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.query;

    if (!email) {
        throw new ApiError(400, "Email search query is required");
    }

    // Find up to 10 users matching the email query, excluding the requesting user
    const users = await User.find({
        email: { $regex: email as string, $options: 'i' },
        _id: { $ne: req.user?._id }
    }).select('full_name email avatar').limit(10);

    return res.status(200).json(
        new ApiResponse(200, users, "Users found successfully")
    );
});
