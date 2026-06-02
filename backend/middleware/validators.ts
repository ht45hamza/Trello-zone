import { body } from 'express-validator';

export const registerValidation = [
    body('full_name', 'Full name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('phone_number', 'Phone number is required').notEmpty(),
];

export const loginValidation = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
];

export const forgotPasswordValidation = [
    body('email', 'Please include a valid email').isEmail(),
];

export const verifyOTPValidation = [
    body('email', 'Please include a valid email').isEmail(),
    body('otp', 'OTP is required').notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

export const resetPasswordValidation = [
    body('resetToken', 'Reset token is required').notEmpty(),
    body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

export const changePasswordValidation = [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
];
