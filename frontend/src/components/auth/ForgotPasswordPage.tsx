import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Layout, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            // Navigate to OTP verification page after 1.5 seconds
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />

            <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative z-10 text-white">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-2xl shadow-lg shadow-amber-500/20 mb-4 transition-transform hover:scale-105 duration-300">
                        <Layout size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h1>
                    <p className="text-slate-400 mt-2">Enter your email to receive a verification code</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>✅</span> OTP sent! Check your email. Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-slate-500"
                                placeholder="name@company.com"
                                required
                                disabled={success}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Send OTP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8">
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold hover:underline inline-flex items-center gap-1.5 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
