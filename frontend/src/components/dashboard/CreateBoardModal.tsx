import React from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newBoardTitle: string;
    setNewBoardTitle: (title: string) => void;
    newBoardColor: string;
    setNewBoardColor: (color: string) => void;
    isCreating: boolean;
    presets: { value: string; label: string }[];
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    newBoardTitle,
    setNewBoardTitle,
    newBoardColor,
    setNewBoardColor,
    isCreating,
    presets
}) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Board"
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Board Title</label>
                    <input
                        type="text"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-800 text-sm font-medium"
                        placeholder="e.g. Q3 Sales Funnel"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                        {presets.map((preset) => {
                            const isSelected = newBoardColor === preset.value;
                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => setNewBoardColor(preset.value)}
                                    className={`h-14 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center cursor-pointer border border-black/5 ${isSelected ? 'ring-4 ring-brand-500/30 scale-[1.03] border-brand-500' : 'hover:scale-[1.03]'}`}
                                    style={{ background: preset.value }}
                                    title={preset.label}
                                >
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-white/20 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center border border-white/40">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isCreating || !newBoardTitle.trim()}
                    className="w-full bg-gradient-to-r from-brand-500 to-sky-500 hover:from-brand-600 hover:to-sky-400 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-brand-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                    {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Create Board'}
                </button>
            </form>
        </Modal>
    );
};

export default CreateBoardModal;
