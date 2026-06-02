import React from 'react';
import Modal from '../common/Modal';
import { Loader2, Camera, KeyRound, LogOut } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isUploadingAvatar: boolean;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    user,
    isUploadingAvatar,
    onAvatarUpload,
    onChangePassword,
    onLogout
}) => {
    const initials = user?.full_name
        ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'HT';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Account Settings"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6 relative">
                    <div className="relative group">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-md overflow-hidden shrink-0 border border-slate-200">
                            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                        </div>
                        <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                            {isUploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                            <input type="file" className="hidden" accept="image/*" onChange={onAvatarUpload} disabled={isUploadingAvatar} />
                        </label>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 truncate">{user?.full_name}</h3>
                        <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <button 
                        onClick={onChangePassword}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200/80 cursor-pointer"
                    >
                        <KeyRound size={18} className="text-slate-500" />
                        Change Account Password
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors border border-red-100/80 cursor-pointer"
                    >
                        <LogOut size={18} />
                        Logout of Session
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
