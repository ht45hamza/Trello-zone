import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

interface DashboardHeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onOpenSettings: () => void;
    user: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    searchTerm,
    setSearchTerm,
    onOpenSettings,
    user
}) => {
    const initials = user?.full_name
        ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'HT';

    return (
        <header className="h-20 border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search boards..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200/60 border border-transparent focus:border-brand-500 focus:bg-white rounded-2xl transition-all text-sm outline-none text-slate-800 placeholder-slate-400"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 ml-4">
                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                </button>
                <button 
                    onClick={onOpenSettings}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Settings size={20} />
                </button>
                <div 
                    className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white text-xs font-extrabold shadow-md cursor-pointer lg:hidden overflow-hidden" 
                    onClick={onOpenSettings}
                >
                    {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
