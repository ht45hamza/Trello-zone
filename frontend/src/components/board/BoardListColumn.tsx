import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Trash2, Plus, X } from 'lucide-react';
import BoardCardItem from './BoardCardItem';

interface BoardListColumnProps {
    list: any;
    index: number;
    listCards: any[];
    editingListId: string | null;
    editingListTitle: string;
    setEditingListId: (id: string | null) => void;
    setEditingListTitle: (title: string) => void;
    onUpdateListTitle: (listId: string) => void;
    onDeleteList: (listId: string) => void;
    addingCardToListId: string | null;
    setAddingCardToListId: (listId: string | null) => void;
    newCardTitle: string;
    setNewCardTitle: (title: string) => void;
    onCreateCard: (listId: string) => void;
    onCardClick: (card: any) => void;
    getDueDateStatus: (date: string) => string;
}

const BoardListColumn: React.FC<BoardListColumnProps> = ({
    list,
    index,
    listCards,
    editingListId,
    editingListTitle,
    setEditingListId,
    setEditingListTitle,
    onUpdateListTitle,
    onDeleteList,
    addingCardToListId,
    setAddingCardToListId,
    newCardTitle,
    setNewCardTitle,
    onCreateCard,
    onCardClick,
    getDueDateStatus
}) => {
    return (
        <Draggable draggableId={list._id} index={index}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`w-76 shrink-0 h-full flex flex-col ${snapshot.isDragging ? 'opacity-90 scale-[1.01]' : ''}`}
                >
                    {/* Frosted List Wrapper */}
                    <div className="bg-white/75 backdrop-blur-lg border border-white/45 rounded-2xl flex flex-col max-h-[calc(100vh-140px)] shadow-lg shadow-black/5 text-slate-800">
                        
                        {/* List Header */}
                        <div 
                            className="p-4 flex items-center justify-between group/header cursor-grab active:cursor-grabbing border-b border-slate-200/40"
                            {...provided.dragHandleProps}
                        >
                            {editingListId === list._id ? (
                                <input
                                    autoFocus
                                    value={editingListTitle}
                                    onChange={(e) => setEditingListTitle(e.target.value)}
                                    onBlur={() => onUpdateListTitle(list._id)}
                                    onKeyDown={(e) => e.key === 'Enter' && onUpdateListTitle(list._id)}
                                    className="font-extrabold text-slate-800 px-2 py-1 text-sm bg-white rounded-xl border border-brand-500 outline-none w-full"
                                />
                            ) : (
                                <h2 
                                    className="font-extrabold text-slate-800 px-1 text-sm cursor-pointer hover:bg-slate-200/50 rounded-lg py-0.5 transition-colors"
                                    onDoubleClick={() => { setEditingListId(list._id); setEditingListTitle(list.title); }}
                                >
                                    {list.title}
                                </h2>
                            )}
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-slate-400 mr-1 bg-slate-200/80 px-2 py-0.5 rounded-full">{listCards.length}</span>
                                <button 
                                    onClick={() => onDeleteList(list._id)}
                                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400"
                                    title="Delete list"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Cards Body */}
                        <Droppable droppableId={list._id} type="card">
                            {(provided) => (
                                <div 
                                    className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {listCards.map((card, cardIndex) => (
                                        <BoardCardItem 
                                            key={card._id}
                                            card={card}
                                            index={cardIndex}
                                            onClick={() => onCardClick(card)}
                                            getDueDateStatus={getDueDateStatus}
                                        />
                                    ))}
                                    {provided.placeholder}
                                    
                                    {/* Add Card Form Inline */}
                                    {addingCardToListId === list._id && (
                                        <div className="bg-white rounded-xl shadow-md p-3 border border-slate-200 animate-in zoom-in-95 duration-150">
                                            <textarea
                                                autoFocus
                                                value={newCardTitle}
                                                onChange={(e) => setNewCardTitle(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onCreateCard(list._id); }}}
                                                className="w-full text-sm border-none focus:ring-0 resize-none p-1.5 outline-none text-slate-800 font-medium placeholder-slate-400"
                                                placeholder="Type a title for this card..."
                                                rows={2}
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <button 
                                                    onClick={() => onCreateCard(list._id)}
                                                    className="bg-brand-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-brand-600 cursor-pointer shadow-sm"
                                                >
                                                    Add Card
                                                </button>
                                                <button 
                                                    onClick={() => {setAddingCardToListId(null); setNewCardTitle('');}}
                                                    className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>

                        {/* List Footer */}
                        {addingCardToListId !== list._id && (
                            <div className="p-3 border-t border-slate-200/40">
                                <button 
                                    onClick={() => { setAddingCardToListId(list._id); setNewCardTitle(''); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-200/40 hover:text-slate-800 rounded-xl transition-all font-bold text-left cursor-pointer"
                                >
                                    <Plus size={16} /> Add a card
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default BoardListColumn;
