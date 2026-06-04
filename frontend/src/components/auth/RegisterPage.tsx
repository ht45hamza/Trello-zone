import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useRegisterMutation } from '../../api/api';
import { Layout, Mail, Lock, User, ArrowRight, Loader2, Camera, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [register, { isLoading }] = useRegisterMutation();
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!avatarFile) {
            setError('Profile image is required');
            return;
        }

        setError('');
        
        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('phone_number', phoneNumber);
            formData.append('avatar', avatarFile);
            if (address) {
                formData.append('address', address);
            }

            const response: any = await register(formData).unwrap();
            setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
            navigate('/');
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Glow Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />

            <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative z-10">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-500 to-sky-400 text-white rounded-2xl shadow-lg shadow-brand-500/20 mb-3 transition-transform hover:scale-105 duration-300">
                        <Layout size={28} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
                    <p className="text-slate-400 mt-1 text-sm">Get started with Trello-Zone today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl text-sm mb-5 flex items-center gap-2 animate-in fade-in duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-20 h-20 rounded-full border-2 border-white/[0.08] hover:border-brand-500 bg-white/[0.04] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group shadow-lg shadow-black/20"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-200 transition-colors">
                                    <Camera size={24} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Camera className="text-white" size={16} />
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-300 mt-2">
                            Profile Image <span className="text-brand-400">*</span>
                        </span>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500 text-sm"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500 text-sm"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500 text-sm"
                                placeholder="Min. 6 characters"
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

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500 text-sm"
                                placeholder="+1 (555) 000-0000"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Address <span className="text-slate-500 font-normal">(Optional)</span></label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-white placeholder-slate-500 text-sm"
                                placeholder="123 Main St, City"
                            />
                        </div>
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-brand-500 to-sky-500 hover:from-brand-600 hover:to-sky-400 text-white font-bold py-3 px-4 rounded-2xl shadow-xl shadow-brand-500/10 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-400 font-bold hover:text-brand-300 hover:underline transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
