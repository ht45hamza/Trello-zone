import { Router } from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword,
    changePassword,
    updateAvatar,
    searchUsers
} from "../controllers/auth-controller";
import { protect } from "../middleware/auth-middleware";
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    verifyOTPValidation,
    resetPasswordValidation,
    changePasswordValidation
} from "../middleware/validators";
import { validate } from "../middleware/validate-middleware";
import { upload } from "../middleware/multer-middleware";

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - phone_number
 *               - avatar
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed or missing parameters
 */
router.post("/register", upload.single('avatar'), registerValidation, validate, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", loginValidation, validate, loginUser);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", refreshAccessToken);

// ─── Forgot Password Flow (Public) ──────────────────────────────────

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP code for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: No account found with this email
 */
router.post("/forgot-password", forgotPasswordValidation, validate, forgotPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", verifyOTPValidation, validate, verifyOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Password too short
 *       401:
 *         description: Invalid or expired reset token
 */
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);

// ─── Protected Routes ────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, getUserProfile);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   put:
 *     summary: Update profile avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Missing file
 */
router.put("/profile/avatar", protect, upload.single('avatar'), updateAvatar);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", protect, logoutUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect password or new password too short
 */
router.post("/change-password", protect, changePasswordValidation, validate, changePassword);

/**
 * @swagger
 * /api/auth/search:
 *   get:
 *     summary: Search users by email query
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email query string
 *     responses:
 *       200:
 *         description: Users list returned
 *       400:
 *         description: Query is required
 */
router.get("/search", protect, searchUsers);

export default router;
