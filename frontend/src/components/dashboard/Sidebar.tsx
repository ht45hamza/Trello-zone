import React from 'react';
import { LayoutGrid, Layout, Star, Clock, KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageBackgrounds } from '../../colors';

interface SidebarProps {
    activeTab: 'boards' | 'starred' | 'recent';
    setActiveTab: (tab: 'boards' | 'starred' | 'recent') => void;
    user: any;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
    const navigate = useNavigate();

    const initials = user?.full_name
        ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'HT';

    return (
        <aside className="w-68 border-r border-slate-200/80 hidden lg:flex flex-col p-5 text-slate-300 justify-between" style={{ backgroundColor: pageBackgrounds.sidebarDark }}>
            <div>
                <div className="flex items-center gap-3 px-2 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-gradient-to-tr from-brand-500 to-sky-400 p-2 rounded-xl text-white shadow-lg shadow-brand-500/10">
                        <LayoutGrid size={20} />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-white">Trello-Zone</span>
                </div>

                <nav className="space-y-1.5">
                    <button 
                        onClick={() => setActiveTab('boards')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'boards' ? 'text-white bg-white/10 shadow-sm border-l-4 border-brand-500' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                    >
                        <Layout size={18} /> Boards
                    </button>
                    <button 
                        onClick={() => setActiveTab('starred')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'starred' ? 'text-white bg-white/10 shadow-sm border-l-4 border-brand-500' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                    >
                        <Star size={18} /> Starred
                    </button>
                    <button 
                        onClick={() => setActiveTab('recent')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'recent' ? 'text-white bg-white/10 shadow-sm border-l-4 border-brand-500' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                    >
                        <Clock size={18} /> Recent
                    </button>
                </nav>
            </div>

            {/* Sidebar User Block */}
            <div className="border-t border-slate-800/80 pt-5">
                <div className="flex items-center gap-3 px-2 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white text-sm font-extrabold shadow-md overflow-hidden shrink-0">
                        {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <button 
                        onClick={() => navigate('/change-password')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                    >
                        <KeyRound size={16} /> Change Password
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
