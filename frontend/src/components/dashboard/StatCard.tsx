import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgClass?: string;
    textClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgClass = 'bg-brand-50', textClass = 'text-brand-500' }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${bgClass} ${textClass}`}>
                {icon}
            </div>
            <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
                <span className="text-2xl font-extrabold text-slate-800">{value}</span>
            </div>
        </div>
    );
};

export default StatCard;
