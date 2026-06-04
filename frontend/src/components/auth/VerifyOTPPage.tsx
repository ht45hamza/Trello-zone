import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerifyOtpMutation, useForgotPasswordMutation } from '../../api/api';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const VerifyOTPPage: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email || '';

    const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
    const [forgotPassword] = useForgotPasswordMutation();

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only single digit
        if (value && !/^\d$/.test(value)) return; // Only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Backspace → move to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp.slice(0, 6));
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');

        try {
            const response: any = await verifyOtp({ email, otp: otpString }).unwrap();
            navigate('/reset-password', { 
                state: { resetToken: response.data.resetToken, email: response.data.email } 
            });
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        try {
            await forgotPassword({ email }).unwrap();
            setResendCooldown(60);
            setError('');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />

            <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative z-10 text-white">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 transition-transform hover:scale-105 duration-300">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Verify Code</h1>
                    <p className="text-slate-400 mt-2">
                        Enter the 6-digit code sent to<br />
                        <span className="font-semibold text-slate-200">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Input Grid */}
                    <div className="flex justify-center gap-3" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold bg-white/[0.04] border border-white/[0.08] rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white placeholder-slate-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Verify Code'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                        Didn't receive a code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                    </p>
                </div>

                <p className="text-center mt-4">
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold hover:underline inline-flex items-center gap-1.5 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOTPPage;
