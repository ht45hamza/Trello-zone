import React from 'react';
import Modal from '../common/Modal';
import { Edit3, Trash2 } from 'lucide-react';

interface BoardMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    board: any;
    isEditingBoardTitle: boolean;
    setIsEditingBoardTitle: (editing: boolean) => void;
    newBoardTitle: string;
    setNewBoardTitle: (title: string) => void;
    onUpdateBoardTitle: () => void;
    onDeleteBoard: () => void;
}

const BoardMenuModal: React.FC<BoardMenuModalProps> = ({
    isOpen,
    onClose,
    board,
    isEditingBoardTitle,
    setIsEditingBoardTitle,
    newBoardTitle,
    setNewBoardTitle,
    onUpdateBoardTitle,
    onDeleteBoard
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Board Configuration Menu"
        >
            <div className="space-y-6">
                {/* Rename Board */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Rename Workspace Title</h4>
                    {isEditingBoardTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onUpdateBoardTitle()}
                                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-brand-500 rounded-xl text-sm outline-none font-semibold text-slate-800"
                            />
                            <button 
                                onClick={onUpdateBoardTitle}
                                className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                            <span className="text-sm font-bold text-slate-800">{board?.title}</span>
                            <button 
                                onClick={() => setIsEditingBoardTitle(true)}
                                className="text-slate-400 hover:text-brand-500 transition-colors p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-5">
                    <button 
                        onClick={onDeleteBoard}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold py-3 rounded-xl transition-all cursor-pointer text-sm border border-red-100"
                    >
                        <Trash2 size={18} /> Delete Board
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 font-bold uppercase tracking-wider">
                        Warning: All lists and cards will be permanently erased.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default BoardMenuModal;
