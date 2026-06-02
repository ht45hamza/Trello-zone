import React from 'react';
import Modal from '../common/Modal';
import { 
    MessageSquare, 
    ListTodo, 
    CheckCircle2, 
    Circle, 
    Image, 
    Loader2, 
    Calendar, 
    Tag, 
    Trash2, 
    X,
    Users
} from 'lucide-react';

interface CardDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: any;
    lists: any[];
    boardMembers: any[];
    isEditingCardTitle: boolean;
    setIsEditingCardTitle: (editing: boolean) => void;
    editingCardTitle: string;
    setEditingCardTitle: (title: string) => void;
    isEditingDescription: boolean;
    setIsEditingDescription: (editing: boolean) => void;
    descriptionText: string;
    setDescriptionText: (text: string) => void;
    newLabelText: string;
    setNewLabelText: (text: string) => void;
    newLabelColor: string;
    setNewLabelColor: (color: string) => void;
    newActivityTitle: string;
    setNewActivityTitle: (title: string) => void;
    newActivityPicture: File | null;
    setNewActivityPicture: (file: File | null) => void;
    isUploadingActivity: boolean;
    onUpdateCardDetails: (updates: any) => void;
    onAddActivity: (e: React.FormEvent) => void;
    onToggleActivity: (activityId: string, is_completed: boolean) => void;
    onDeleteActivity: (activityId: string) => void;
    onDeleteCard: (cardId: string) => void;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
    isOpen,
    onClose,
    card,
    lists,
    boardMembers,
    isEditingCardTitle,
    setIsEditingCardTitle,
    editingCardTitle,
    setEditingCardTitle,
    isEditingDescription,
    setIsEditingDescription,
    descriptionText,
    setDescriptionText,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    newActivityTitle,
    setNewActivityTitle,
    newActivityPicture,
    setNewActivityPicture,
    isUploadingActivity,
    onUpdateCardDetails,
    onAddActivity,
    onToggleActivity,
    onDeleteActivity,
    onDeleteCard
}) => {
    if (!card) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={card.title || 'Card Details'}
            maxWidth="max-w-4xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-800 max-h-[75vh] overflow-y-auto pr-1">
                
                {/* Left column (2/3 width) - Title, Description, Checklist */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Card Title Editable Section */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Title</label>
                        {isEditingCardTitle ? (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={editingCardTitle} 
                                    onChange={(e) => setEditingCardTitle(e.target.value)}
                                    className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-semibold text-slate-800"
                                    autoFocus
                                />
                                <button 
                                    onClick={() => {
                                        if (editingCardTitle.trim()) {
                                            onUpdateCardDetails({ title: editingCardTitle });
                                            setIsEditingCardTitle(false);
                                        }
                                    }}
                                    className="bg-brand-500 text-white px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setIsEditingCardTitle(false)}
                                    className="text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <h2 
                                onClick={() => {
                                    setEditingCardTitle(card.title);
                                    setIsEditingCardTitle(true);
                                }}
                                className="text-lg font-extrabold text-slate-800 hover:bg-slate-100/80 px-2 py-1 -ml-2 rounded-xl cursor-pointer transition-colors inline-block"
                            >
                                {card.title}
                            </h2>
                        )}
                        <span className="text-xs text-slate-400 mt-1 block">
                            in list <span className="font-bold text-slate-600 underline">{lists.find(l => l._id === card.list_id)?.title || 'list'}</span>
                        </span>
                    </div>

                    {/* Description Section */}
                    <div className="border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-2 mb-2.5">
                            <MessageSquare size={18} className="text-slate-500" />
                            <h3 className="text-sm font-bold text-slate-700">Description</h3>
                        </div>
                        
                        {isEditingDescription ? (
                            <div className="space-y-3">
                                <textarea
                                    value={descriptionText}
                                    onChange={(e) => setDescriptionText(e.target.value)}
                                    className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-800"
                                    placeholder="Add a more detailed description for this card..."
                                    rows={4}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            onUpdateCardDetails({ description: descriptionText });
                                            setIsEditingDescription(false);
                                        }}
                                        className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                                    >
                                        Save Description
                                    </button>
                                    <button
                                        onClick={() => setIsEditingDescription(false)}
                                        className="text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => {
                                    setDescriptionText(card.description || '');
                                    setIsEditingDescription(true);
                                }}
                                className={`p-3.5 rounded-2xl text-sm min-h-[80px] cursor-pointer hover:bg-slate-100/80 transition-colors ${card.description ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-400 font-medium'}`}
                            >
                                {card.description || 'Add a more detailed description...'}
                            </div>
                        )}
                    </div>

                    {/* Activities Checklist */}
                    <div className="border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-2 mb-3">
                            <ListTodo size={18} className="text-slate-500" />
                            <h3 className="text-sm font-bold text-slate-700">Checklist Items</h3>
                        </div>
                        
                        {/* Progress Bar */}
                        {card.activities?.length > 0 && (
                            <div className="mb-5 flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="text-xs font-extrabold text-slate-500 w-8 text-right shrink-0">
                                    {Math.round((card.activities.filter((a: any) => a.is_completed).length / card.activities.length) * 100)}%
                                </span>
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${card.activities.filter((a: any) => a.is_completed).length === card.activities.length ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                        style={{ width: `${(card.activities.filter((a: any) => a.is_completed).length / card.activities.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Activity List */}
                        <div className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
                            {card.activities?.map((activity: any) => (
                                <div key={activity._id} className="flex items-start gap-3 group/act hover:bg-slate-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-100">
                                    <button 
                                        onClick={() => onToggleActivity(activity._id, activity.is_completed)}
                                        className={`mt-0.5 transition-colors cursor-pointer ${activity.is_completed ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {activity.is_completed ? <CheckCircle2 size={18} fill="currentColor" className="text-white" /> : <Circle size={18} />}
                                    </button>
                                    <div className="flex-1">
                                        <span className={`text-sm font-semibold block ${activity.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                            {activity.title}
                                        </span>
                                        {activity.picture && (
                                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 max-w-[200px] shadow-sm group/pic">
                                                <img src={activity.picture} alt="Attachment" className="w-full h-auto object-cover" />
                                                <a 
                                                    href={activity.picture} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/pic:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                                >
                                                    View Image
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => onDeleteActivity(activity._id)}
                                        className="opacity-0 group-hover/act:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                        title="Delete item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Activity Input */}
                        <form onSubmit={onAddActivity} className="flex items-start gap-2 flex-col sm:flex-row bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                            <div className="flex-1 w-full relative">
                                <input
                                    type="text"
                                    value={newActivityTitle}
                                    onChange={(e) => setNewActivityTitle(e.target.value)}
                                    placeholder="Add a checklist item..."
                                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-800 font-medium"
                                />
                                <label className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 cursor-pointer p-1 transition-colors">
                                    <Image size={16} />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => setNewActivityPicture(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                {newActivityPicture && (
                                    <span className="text-[10px] text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-lg truncate max-w-[100px] font-bold">
                                        {newActivityPicture.name}
                                    </span>
                                )}
                                <button 
                                    type="submit"
                                    disabled={!newActivityTitle.trim() || isUploadingActivity}
                                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer shadow-sm"
                                >
                                    {isUploadingActivity ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right column (1/3 width) - Card actions: Labels, Due Date, etc. */}
                <div className="space-y-6 md:border-l border-slate-100 md:pl-6">
                    
                    {/* Card Members Action */}
                    <div>
                        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-2">
                            <Users size={13} />
                            <span>Card Members</span>
                        </div>
                        
                        {/* List of currently assigned members */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {card.members?.map((member: any) => (
                                <div 
                                    key={member._id}
                                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 transition-colors shadow-sm relative group/member shrink-0"
                                >
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.full_name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center uppercase shrink-0">
                                            {member.full_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span className="truncate max-w-[80px]">{member.full_name?.split(' ')[0]}</span>
                                    <button 
                                        onClick={() => {
                                            const updatedIds = card.members.filter((m: any) => m._id !== member._id).map((m: any) => m._id);
                                            onUpdateCardDetails({ members: updatedIds });
                                        }}
                                        className="hover:bg-slate-300 rounded-full p-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 shrink-0"
                                        title="Unassign member"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {(!card.members || card.members.length === 0) && (
                                <span className="text-xs text-slate-400 italic">No members assigned</span>
                            )}
                        </div>

                        {/* Assign member selection drop-down */}
                        <select
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) return;
                                const currentIds = card.members?.map((m: any) => m._id) || [];
                                if (!currentIds.includes(selectedId)) {
                                    onUpdateCardDetails({ members: [...currentIds, selectedId] });
                                }
                                e.target.value = ''; // reset selection
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 rounded-xl text-xs font-bold outline-none text-slate-700 cursor-pointer"
                        >
                            <option value="">+ Assign Member...</option>
                            {boardMembers
                                .filter((bm: any) => !(card.members?.some((m: any) => m._id === bm._id)))
                                .map((bm: any) => (
                                    <option key={bm._id} value={bm._id}>
                                        {bm.full_name} ({bm.email})
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Due Date Card Action */}
                    <div>
                        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-2">
                            <Calendar size={13} />
                            <span>Due Date</span>
                        </div>
                        <input
                            type="date"
                            value={card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : ''}
                            onChange={(e) => onUpdateCardDetails({ due_date: e.target.value || null })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 rounded-xl text-xs font-bold outline-none text-slate-700"
                        />
                        {card.due_date && (
                            <button
                                onClick={() => onUpdateCardDetails({ due_date: null })}
                                className="text-xs text-red-500 hover:text-red-600 font-bold mt-1.5 block cursor-pointer"
                            >
                                Remove Due Date
                            </button>
                        )}
                    </div>

                    {/* Labels Card Action */}
                    <div>
                        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-2.5">
                            <Tag size={13} />
                            <span>Card Labels</span>
                        </div>
                        
                        {/* Existing Labels on Card */}
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                            {card.labels?.map((label: any, idx: number) => (
                                <span 
                                    key={idx} 
                                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white flex items-center gap-1 shadow-sm"
                                    style={{ backgroundColor: label.color }}
                                >
                                    {label.text || ''}
                                    <button 
                                        onClick={() => {
                                            const updatedLabels = card.labels.filter((_: any, i: number) => i !== idx);
                                            onUpdateCardDetails({ labels: updatedLabels });
                                        }}
                                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                            {(!card.labels || card.labels.length === 0) && (
                                <span className="text-xs text-slate-400 italic">No labels attached</span>
                            )}
                        </div>

                        {/* Create and attach label */}
                        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl space-y-2.5">
                            <input 
                                type="text"
                                placeholder="Add label text..."
                                value={newLabelText}
                                onChange={(e) => setNewLabelText(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 font-medium"
                            />
                            
                            <div className="grid grid-cols-5 gap-1.5">
                                {['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#000000'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewLabelColor(color)}
                                        className={`h-6 rounded-full border border-black/5 cursor-pointer relative ${newLabelColor === color ? 'ring-2 ring-brand-500 ring-offset-1 scale-105' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {newLabelColor === color && (
                                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    if (!newLabelColor) return;
                                    const updatedLabels = [...(card.labels || []), { text: newLabelText, color: newLabelColor }];
                                    onUpdateCardDetails({ labels: updatedLabels });
                                    setNewLabelText('');
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                            >
                                Add & Save Label
                            </button>
                        </div>
                    </div>

                    {/* Card Actions Options */}
                    <div className="border-t border-slate-100 pt-5">
                        <button
                            onClick={() => onDeleteCard(card._id)}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all text-xs border border-red-100/50 cursor-pointer hover:scale-[1.01]"
                        >
                            <Trash2 size={14} /> Delete Card permanently
                        </button>
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default CardDetailsModal;
