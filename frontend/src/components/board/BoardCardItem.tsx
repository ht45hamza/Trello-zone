import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';

interface BoardCardItemProps {
    card: any;
    index: number;
    onClick: () => void;
    getDueDateStatus: (date: string) => string;
}

const BoardCardItem: React.FC<BoardCardItemProps> = ({
    card,
    index,
    onClick,
    getDueDateStatus
}) => {
    const completedActivities = card.activities?.filter((a: any) => a.is_completed).length || 0;
    const totalActivities = card.activities?.length || 0;
    const allDone = totalActivities > 0 && completedActivities === totalActivities;

    return (
        <Draggable draggableId={card._id} index={index}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef} 
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps} 
                    style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform} scale(1.02)` 
                            : provided.draggableProps.style?.transform
                    }}
                    onClick={onClick}
                    className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md group/card border border-slate-200/50 hover:border-brand-300 cursor-pointer ${snapshot.isDragging ? 'shadow-2xl border-brand-500 bg-white ring-2 ring-brand-500/15' : 'transition-[box-shadow,border-color,background-color] duration-200'}`}
                >
                    {/* Labels */}
                    {card.labels?.length > 0 && (
                        <div className="flex gap-1 mb-2.5 flex-wrap">
                            {card.labels.map((label: any, i: number) => (
                                <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white/90" style={{ backgroundColor: label.color || '#0c87eb' }}>
                                    {label.text || ''}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{card.title}</p>
                    </div>
                    
                    {/* Card Metadata indicators */}
                    {(card.due_date || card.description || card.attachments?.length > 0 || totalActivities > 0 || card.members?.length > 0) && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-slate-400 text-xs">
                            <div className="flex items-center gap-2">
                                {card.due_date && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        getDueDateStatus(card.due_date) === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                        getDueDateStatus(card.due_date) === 'today' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}>
                                        <Calendar size={11} />
                                        <span>{new Date(card.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                
                                {card.description && (
                                    <div className="flex items-center gap-0.5 text-slate-500" title="This card has a description">
                                        <MessageSquare size={13} />
                                    </div>
                                )}
                                
                                {card.attachments?.length > 0 && (
                                    <div className="flex items-center gap-0.5 text-slate-500" title="Attachments">
                                        <Paperclip size={13} />
                                        <span className="text-[10px] font-bold">{card.attachments.length}</span>
                                    </div>
                                )}

                                {totalActivities > 0 && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${allDone ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                        <CheckSquare size={11} />
                                        <span>{completedActivities}/{totalActivities}</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Members Avatars */}
                            {card.members?.length > 0 && (
                                <div className="flex -space-x-1.5 overflow-hidden ml-auto">
                                    {card.members.slice(0, 3).map((m: any) => (
                                        m.avatar ? (
                                            <img 
                                                key={m._id} 
                                                src={m.avatar} 
                                                alt={m.full_name} 
                                                className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover shrink-0" 
                                                title={m.full_name}
                                            />
                                        ) : (
                                            <div 
                                                key={m._id} 
                                                className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-brand-500 text-white text-[8px] font-extrabold flex items-center justify-center uppercase shrink-0"
                                                title={m.full_name}
                                            >
                                                {m.full_name?.charAt(0) || 'U'}
                                            </div>
                                        )
                                    ))}
                                    {card.members.length > 3 && (
                                        <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 text-slate-600 text-[8px] font-extrabold flex items-center justify-center shrink-0">
                                            +{card.members.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default BoardCardItem;
