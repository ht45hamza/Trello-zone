import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
                onClick={onClose} 
            />
            <div className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 sm:duration-200`}>
                {/* Mobile Bottom Sheet Drag Handle */}
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 sm:hidden shrink-0" />
                
                <div className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>
                <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
