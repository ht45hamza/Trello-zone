import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import ForgotPasswordPage from '../components/auth/ForgotPasswordPage';
import VerifyOTPPage from '../components/auth/VerifyOTPPage';
import ResetPasswordPage from '../components/auth/ResetPasswordPage';
import ChangePasswordPage from '../components/security/ChangePasswordPage';
import Dashboard from '../components/dashboard/Dashboard';
import BoardView from '../components/board/BoardView';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board/:id" element={<BoardView />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
