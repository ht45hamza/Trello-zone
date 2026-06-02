import React from 'react';
import { Star, Trash2, ChevronRight } from 'lucide-react';

interface BoardCardProps {
    board: any;
    userId: string;
    onClick: () => void;
    onToggleStar: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
    board,
    userId,
    onClick,
    onToggleStar,
    onDelete
}) => {
    const isStarred = board.starredBy?.includes(userId);

    return (
        <div 
            onClick={onClick}
            className="group relative h-44 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/40"
            style={{ background: board.background_color || '#0c87eb' }}
        >
            {board.background_image && (
                <img 
                    src={board.background_image} 
                    alt={board.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300" />
            
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white relative z-10">
                <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-lg leading-snug pr-4 tracking-tight drop-shadow-sm">{board.title}</h3>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={onToggleStar}
                            className={`opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-white/20 rounded-xl ${isStarred ? 'text-yellow-400 opacity-100' : 'text-white'}`}
                            title={isStarred ? "Unstar board" : "Star board"}
                        >
                            <Star size={16} fill={isStarred ? "currentColor" : "none"} />
                        </button>
                        <button 
                            onClick={onDelete}
                            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/30 rounded-xl text-white hover:text-red-200"
                            title="Delete board"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                        {board.owner?.full_name ? board.owner.full_name.split(' ')[0] : 'Owner'}
                    </span>
                    <div className="bg-white/25 group-hover:bg-white/40 p-1.5 rounded-xl transition-colors">
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;
