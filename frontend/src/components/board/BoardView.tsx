import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import api from '../../api/axios';
import useAuthStore from '../../store/useAuthStore';
import { 
    Plus, 
    X, 
    Loader2
} from 'lucide-react';
import Modal from '../common/Modal';
import BoardHeader from './BoardHeader';
import BoardListColumn from './BoardListColumn';
import CardDetailsModal from './CardDetailsModal';
import BoardMenuModal from './BoardMenuModal';
import BoardMembersModal from './BoardMembersModal';

const BoardView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState<any>(null);
    const [lists, setLists] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [addingCardToListId, setAddingCardToListId] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [editingListTitle, setEditingListTitle] = useState('');
    
    // Card modal edit states
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isEditingCardTitle, setIsEditingCardTitle] = useState(false);
    const [editingCardTitle, setEditingCardTitle] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionText, setDescriptionText] = useState('');
    const [newLabelText, setNewLabelText] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3b82f6');

    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityPicture, setNewActivityPicture] = useState<File | null>(null);
    const [isUploadingActivity, setIsUploadingActivity] = useState(false);
    
    const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    
    const [showShareSuccess, setShowShareSuccess] = useState(false);

    const { user } = useAuthStore();

    const fetchBoardData = async () => {
        setError(null);
        try {
            const boardRes: any = await api.get(`/boards/${id}`);
            const listsRes: any = await api.get(`/lists/board/${id}`);
            const cardsRes: any = await api.get(`/cards/board/all?board_id=${id}`);
            
            setBoard(boardRes.data);
            setLists(listsRes.data || []);
            setCards(cardsRes.data || []);
        } catch (err: any) {
            console.error('Failed to fetch board data:', err);
            setError(err.message || 'Failed to load board data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBoardData();
    }, [id]);

    const handleCreateList = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newListTitle.trim()) return;

        try {
            await api.post('/lists', {
                title: newListTitle,
                board_id: id,
                position: lists.length
            });
            setNewListTitle('');
            setIsAddingList(false);
            fetchBoardData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteList = async (listId: string) => {
        if (!window.confirm('Delete this list and all its cards?')) return;
        try {
            const listCards = cards.filter(c => c.list_id === listId);
            for (const card of listCards) {
                await api.delete(`/cards/${card._id}`);
            }
            await api.delete(`/lists/${listId}`);
            fetchBoardData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateListTitle = async (listId: string) => {
        if (!editingListTitle.trim()) {
            setEditingListId(null);
            return;
        }
        try {
            await api.put(`/lists/${listId}`, { title: editingListTitle });
            setEditingListId(null);
            fetchBoardData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateCard = async (listId: string) => {
        if (!newCardTitle.trim()) return;

        try {
            await api.post('/cards', {
                title: newCardTitle,
                list_id: listId,
                board_id: id,
                position: cards.filter(c => c.list_id === listId).length
            });
            setNewCardTitle('');
            setAddingCardToListId(null);
            fetchBoardData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        try {
            await api.delete(`/cards/${cardId}`);
            setCards(prev => prev.filter(c => c._id !== cardId));
            if (selectedCard?._id === cardId) setSelectedCard(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateCardDetails = async (updates: any) => {
        if (!selectedCard) return;
        try {
            const res: any = await api.put(`/cards/${selectedCard._id}`, updates);
            setCards(prev => prev.map(c => c._id === selectedCard._id ? res.data : c));
            setSelectedCard(res.data);
        } catch (err) {
            console.error('Failed to update card details:', err);
        }
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newActivityTitle.trim() || !selectedCard) return;

        setIsUploadingActivity(true);
        try {
            const formData = new FormData();
            formData.append('title', newActivityTitle);
            if (newActivityPicture) {
                formData.append('picture', newActivityPicture);
            }

            const res: any = await api.post(`/cards/${selectedCard._id}/activities`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setCards(prev => prev.map(c => c._id === selectedCard._id ? res.data : c));
            setSelectedCard(res.data);
            setNewActivityTitle('');
            setNewActivityPicture(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploadingActivity(false);
        }
    };

    const handleToggleActivity = async (activityId: string, is_completed: boolean) => {
        if (!selectedCard) return;
        try {
            const res: any = await api.put(`/cards/${selectedCard._id}/activities/${activityId}`, { is_completed: !is_completed });
            
            setCards(prev => prev.map(c => c._id === selectedCard._id ? res.data : c));
            setSelectedCard(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteActivity = async (activityId: string) => {
        if (!selectedCard) return;
        try {
            const res: any = await api.delete(`/cards/${selectedCard._id}/activities/${activityId}`);
            
            setCards(prev => prev.map(c => c._id === selectedCard._id ? res.data : c));
            setSelectedCard(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onDragEnd = async (result: any) => {
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        if (type === 'list') {
            const newLists = Array.from(lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);
            
            const updatedLists = newLists.map((list, index) => ({ ...list, position: index }));
            setLists(updatedLists);

            try {
                await api.post('/lists/reorder', { 
                    items: updatedLists.map(list => ({ _id: list._id, position: list.position })) 
                });
            } catch (err) {
                console.error(err);
            }
            return;
        }

        // Handle Card Drag
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        let newCards = Array.from(cards);
        const cardIndex = newCards.findIndex(c => c._id === draggableId);
        if (cardIndex === -1) return;

        const [movedCard] = newCards.splice(cardIndex, 1);
        movedCard.list_id = destListId;

        const destCards = newCards.filter(c => c.list_id === destListId).sort((a, b) => a.position - b.position);
        destCards.splice(destination.index, 0, movedCard);
        const updatedDestCards = destCards.map((c, idx) => ({ ...c, position: idx }));

        let itemsToUpdate = updatedDestCards.map(c => ({ _id: c._id, position: c.position, list_id: c.list_id }));
        
        if (sourceListId !== destListId) {
            const sourceCards = newCards.filter(c => c.list_id === sourceListId).sort((a, b) => a.position - b.position);
            const updatedSourceCards = sourceCards.map((c, idx) => ({ ...c, position: idx }));
            itemsToUpdate = [...itemsToUpdate, ...updatedSourceCards.map(c => ({ _id: c._id, position: c.position, list_id: c.list_id }))];
            
            newCards = newCards.filter(c => c.list_id !== sourceListId && c.list_id !== destListId)
                .concat(updatedSourceCards, updatedDestCards);
        } else {
            newCards = newCards.filter(c => c.list_id !== destListId).concat(updatedDestCards);
        }

        setCards(newCards);

        try {
            await api.post('/cards/reorder', { items: itemsToUpdate });
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2500);
    };

    const handleDeleteBoard = async () => {
        if (!window.confirm('Are you sure you want to delete this entire board?')) return;
        try {
            await api.delete(`/boards/${id}`);
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBoardTitle = async () => {
        if (!newBoardTitle.trim() || newBoardTitle === board.title) {
            setIsEditingBoardTitle(false);
            return;
        }
        try {
            await api.put(`/boards/${id}`, { title: newBoardTitle });
            setBoard({ ...board, title: newBoardTitle });
            setIsEditingBoardTitle(false);
        } catch (err) {
            console.error(err);
        }
    };

    const isStarred = board?.starredBy?.includes(user?._id);

    const handleToggleBoardStar = async () => {
        if (!board) return;
        try {
            await api.put(`/boards/${board._id}/star`);
            fetchBoardData();
        } catch (err) {
            console.error(err);
        }
    };

    const getDueDateStatus = (dueDateStr: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(dueDateStr);
        due.setHours(0,0,0,0);
        
        if (due < today) return 'overdue';
        if (due.getTime() === today.getTime()) return 'today';
        return 'pending';
    };

    if (error) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0b0f19] px-6 text-center font-sans">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-950/40 border border-red-500/20 text-red-500 rounded-full mb-6 text-3xl animate-bounce">
                <span>⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Failed to Load Board</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">{error}</p>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                    Back to Dashboard
                </button>
                <button 
                    onClick={() => { setLoading(true); fetchBoardData(); }}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-brand-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0b0f19]">
            <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
            <p className="text-slate-400 font-semibold animate-pulse text-sm">Synchronizing workspace cards...</p>
        </div>
    );

    return (
        <div 
            className="h-screen w-full flex flex-col overflow-hidden transition-all duration-500 font-sans"
            style={{ background: board?.background_color || '#0079bf' }}
        >
            {/* Share Success Toast */}
            {showShareSuccess && (
                <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 text-sm font-bold">
                    <span>🔗</span> Board link copied to clipboard!
                </div>
            )}

            {/* Premium Glassmorphic Header */}
            <BoardHeader 
                board={board} 
                listsCount={lists.length} 
                cardsCount={cards.length} 
                isStarred={isStarred} 
                onToggleStar={handleToggleBoardStar} 
                onShare={handleShare} 
                onMembersOpen={() => setIsMembersOpen(true)}
                onMenuOpen={() => {
                    setNewBoardTitle(board?.title || '');
                    setIsBoardMenuOpen(true);
                }} 
                isEditingTitle={isEditingBoardTitle} 
                setIsEditingTitle={setIsEditingBoardTitle} 
                newTitle={newBoardTitle} 
                setNewTitle={setNewBoardTitle} 
                onUpdateTitle={handleUpdateBoardTitle} 
            />

            {/* Kanban Workspace */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin dark-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board" type="list" direction="horizontal">
                        {(provided) => (
                            <div 
                                className="flex gap-4 h-full items-start"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {lists.map((list, index) => {
                                    const listCards = cards.filter(card => card.list_id === list._id).sort((a, b) => a.position - b.position);
                                    
                                    return (
                                        <BoardListColumn 
                                            key={list._id} 
                                            list={list} 
                                            index={index} 
                                            listCards={listCards} 
                                            editingListId={editingListId} 
                                            editingListTitle={editingListTitle} 
                                            setEditingListId={setEditingListId} 
                                            setEditingListTitle={setEditingListTitle} 
                                            onUpdateListTitle={handleUpdateListTitle} 
                                            onDeleteList={handleDeleteList} 
                                            addingCardToListId={addingCardToListId} 
                                            setAddingCardToListId={setAddingCardToListId} 
                                            newCardTitle={newCardTitle} 
                                            setNewCardTitle={setNewCardTitle} 
                                            onCreateCard={handleCreateCard} 
                                            onCardClick={(card) => {
                                                setSelectedCard(card);
                                                setEditingCardTitle(card.title);
                                                setDescriptionText(card.description || '');
                                            }} 
                                            getDueDateStatus={getDueDateStatus} 
                                        />
                                    );
                                })}
                                {provided.placeholder}

                                {/* Add New Column Section */}
                                {isAddingList ? (
                                    <div className="w-76 shrink-0 bg-white/75 backdrop-blur-lg border border-white/45 rounded-2xl p-3 h-fit shadow-lg animate-in zoom-in-95 duration-150">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
                                            placeholder="Enter list title..."
                                        />
                                        <div className="flex items-center gap-2 mt-2 px-1">
                                            <button 
                                                onClick={() => handleCreateList()}
                                                className="bg-brand-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-brand-600 cursor-pointer shadow-sm"
                                            >
                                                Add List
                                            </button>
                                            <button 
                                                onClick={() => {setIsAddingList(false); setNewListTitle('');}}
                                                className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsAddingList(true)}
                                        className="w-76 shrink-0 bg-white/20 hover:bg-white/30 border border-white/10 backdrop-blur-md text-white rounded-2xl p-4 flex items-center gap-2.5 font-bold transition-all h-fit cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        <Plus size={20} /> Add another list
                                    </button>
                                )}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </main>

            {/* Immersive Card Details Modal */}
            <CardDetailsModal 
                isOpen={!!selectedCard} 
                onClose={() => { 
                    setSelectedCard(null); 
                    setNewActivityTitle(''); 
                    setNewActivityPicture(null); 
                    setIsEditingDescription(false);
                    setIsEditingCardTitle(false);
                }} 
                card={selectedCard} 
                lists={lists} 
                boardMembers={board ? [board.owner, ...(board.members || [])] : []}
                isEditingCardTitle={isEditingCardTitle} 
                setIsEditingCardTitle={setIsEditingCardTitle} 
                editingCardTitle={editingCardTitle} 
                setEditingCardTitle={setEditingCardTitle} 
                isEditingDescription={isEditingDescription} 
                setIsEditingDescription={setIsEditingDescription} 
                descriptionText={descriptionText} 
                setDescriptionText={setDescriptionText} 
                newLabelText={newLabelText} 
                setNewLabelText={setNewLabelText} 
                newLabelColor={newLabelColor} 
                setNewLabelColor={setNewLabelColor} 
                newActivityTitle={newActivityTitle} 
                setNewActivityTitle={setNewActivityTitle} 
                newActivityPicture={newActivityPicture} 
                setNewActivityPicture={setNewActivityPicture} 
                isUploadingActivity={isUploadingActivity} 
                onUpdateCardDetails={handleUpdateCardDetails} 
                onAddActivity={handleAddActivity} 
                onToggleActivity={handleToggleActivity} 
                onDeleteActivity={handleDeleteActivity} 
                onDeleteCard={handleDeleteCard} 
            />

            {/* Board Configuration Menu Modal */}
            <BoardMenuModal 
                isOpen={isBoardMenuOpen} 
                onClose={() => { setIsBoardMenuOpen(false); setIsEditingBoardTitle(false); }} 
                board={board} 
                isEditingBoardTitle={isEditingBoardTitle} 
                setIsEditingBoardTitle={setIsEditingBoardTitle} 
                newBoardTitle={newBoardTitle} 
                setNewBoardTitle={setNewBoardTitle} 
                onUpdateBoardTitle={handleUpdateBoardTitle} 
                onDeleteBoard={handleDeleteBoard} 
            />

            {/* Board Members Modal */}
            <BoardMembersModal
                isOpen={isMembersOpen}
                onClose={() => setIsMembersOpen(false)}
                board={board}
                onBoardUpdated={(updatedBoard) => setBoard(updatedBoard)}
            />
        </div>
    );
};

export default BoardView;
