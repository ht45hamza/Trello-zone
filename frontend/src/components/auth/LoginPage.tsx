import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/axios';
import { Layout, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response: any = await api.post('/auth/login', { email, password });
            setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />

            <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-brand-500 to-sky-400 text-white rounded-2xl shadow-lg shadow-brand-500/20 mb-4 transition-transform hover:scale-105 duration-300">
                        <Layout size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-slate-400 mt-2">Sign in to your Trello-Zone account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>⚠️</span> {error}
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
                                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 hover:underline font-medium transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-500 to-sky-500 hover:from-brand-600 hover:to-sky-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-brand-500/10 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 hover:underline transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
