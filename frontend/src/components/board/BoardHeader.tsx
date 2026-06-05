import React from 'react';
import { ChevronLeft, Star, MoreHorizontal, Users, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BoardHeaderProps {
    board: any;
    listsCount: number;
    cardsCount: number;
    isStarred: boolean;
    onToggleStar: () => void;
    onShare: () => void;
    onMembersOpen: () => void;
    onMenuOpen: () => void;
    isEditingTitle: boolean;
    setIsEditingTitle: (editing: boolean) => void;
    newTitle: string;
    setNewTitle: (title: string) => void;
    onUpdateTitle: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
    board,
    listsCount,
    cardsCount,
    isStarred,
    onToggleStar,
    onShare,
    onMembersOpen,
    onMenuOpen,
    isEditingTitle,
    setIsEditingTitle,
    newTitle,
    setNewTitle,
    onUpdateTitle
}) => {
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-[#0f172a]/25 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 text-white shrink-0 border-b border-white/10">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <button 
                    onClick={() => navigate('/')} 
                    className="hover:bg-white/15 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 text-white/90 shrink-0"
                >
                    <ChevronLeft size={20} />
                </button>
                
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <input 
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={onUpdateTitle}
                            onKeyDown={(e) => e.key === 'Enter' && onUpdateTitle()}
                            className="bg-white/15 border border-white/20 rounded-xl px-3 py-1 text-sm font-bold outline-none text-white focus:bg-white/20 w-28 xs:w-36 sm:w-48"
                        />
                    </div>
                ) : (
                    <h1 
                        onClick={() => {
                            setNewTitle(board?.title || '');
                            setIsEditingTitle(true);
                        }}
                        className="text-base sm:text-xl font-extrabold hover:bg-white/10 px-2 py-1 -ml-1 rounded-xl transition-colors cursor-pointer tracking-tight truncate max-w-[100px] xs:max-w-[150px] sm:max-w-xs md:max-w-md"
                    >
                        {board?.title || 'Board'}
                    </h1>
                )}

                <button 
                    onClick={onToggleStar}
                    className={`p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/10 hover:scale-105 shrink-0 ${isStarred ? 'text-yellow-400' : 'text-white/60 hover:text-white'}`}
                >
                    <Star size={18} fill={isStarred ? "currentColor" : "none"} />
                </button>
                <span className="text-[10px] sm:text-xs bg-white/10 border border-white/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full hidden md:inline-block font-semibold tracking-wide shrink-0">
                    {listsCount} columns · {cardsCount} items
                </span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <button 
                    onClick={onMembersOpen}
                    className="bg-white/10 border border-white/10 hover:bg-white/20 text-white px-2.5 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1.5"
                >
                    <Users size={14} className="shrink-0" />
                    <span className="hidden xs:inline">Members ({board ? (board.members?.length || 0) + 1 : 1})</span>
                    <span className="xs:hidden">({board ? (board.members?.length || 0) + 1 : 1})</span>
                </button>
                <button 
                    onClick={onShare}
                    className="bg-white text-slate-900 px-2.5 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1.5"
                >
                    <Share2 size={14} className="shrink-0" />
                    <span className="hidden xs:inline">Share Link</span>
                    <span className="xs:hidden">Share</span>
                </button>
                <button 
                    onClick={onMenuOpen}
                    className="hover:bg-white/15 p-2 sm:p-2.5 rounded-xl transition-all text-white/80 hover:text-white cursor-pointer shrink-0"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </header>
    );
};

export default BoardHeader;
