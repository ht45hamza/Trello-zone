import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../../api/api';
import { Lock, KeyRound, ArrowRight, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const resetToken = (location.state as any)?.resetToken || '';
    const email = (location.state as any)?.email || '';

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    // Redirect if no reset token in state
    useEffect(() => {
        if (!resetToken) {
            navigate('/forgot-password');
        }
    }, [resetToken, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await resetPassword({ resetToken, newPassword }).unwrap();
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />

            <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative z-10 text-white">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-violet-500 to-purple-400 text-white rounded-2xl shadow-lg shadow-violet-500/20 mb-4 transition-transform hover:scale-105 duration-300">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">New Password</h1>
                    <p className="text-slate-400 mt-2">
                        Set a new password for<br />
                        <span className="font-semibold text-slate-200">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-4 rounded-2xl text-sm mb-6 flex items-center gap-3 animate-in fade-in duration-300">
                        <CheckCircle size={20} className="text-green-400" />
                        <div>
                            <p className="font-semibold">Password reset successfully!</p>
                            <p className="text-green-300 text-xs mt-0.5">Redirecting to login...</p>
                        </div>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-white placeholder-slate-500"
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-white placeholder-slate-500"
                                    placeholder="Re-enter password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-violet-500/10 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:shadow-violet-500/20 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Reset Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-center mt-8">
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold hover:underline inline-flex items-center gap-1.5 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
