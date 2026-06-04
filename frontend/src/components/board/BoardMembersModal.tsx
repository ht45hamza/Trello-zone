import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { 
    useLazySearchUsersQuery, 
    useAddBoardMemberMutation, 
    useRemoveBoardMemberMutation 
} from '../../api/api';
import useAuthStore from '../../store/useAuthStore';
import { 
    Search, 
    UserPlus, 
    UserMinus, 
    Crown, 
    Mail, 
    Loader2, 
    X 
} from 'lucide-react';

interface BoardMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    board: any;
    onBoardUpdated: (updatedBoard: any) => void;
}

const BoardMembersModal: React.FC<BoardMembersModalProps> = ({
    isOpen,
    onClose,
    board,
    onBoardUpdated
}) => {
    const { user: currentUser } = useAuthStore();
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    
    // RTK Query hooks
    const [triggerSearch, { isFetching: isSearching }] = useLazySearchUsersQuery();
    const [addBoardMember] = useAddBoardMemberMutation();
    const [removeBoardMember] = useRemoveBoardMemberMutation();

    // Action loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Run user search when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setError(null);
            try {
                const response: any = await triggerSearch(searchQuery).unwrap();
                setSearchResults(response.data || []);
            } catch (err: any) {
                console.error("Search failed:", err);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, triggerSearch]);

    if (!board) return null;

    const isOwner = board.owner?._id === currentUser?._id;

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const res: any = await addBoardMember({ id: board._id, email: selectedUser.email }).unwrap();
            onBoardUpdated(res.data);
            setSuccessMessage(`Successfully added ${selectedUser.full_name} to the board!`);
            setSelectedUser(null);
            setSearchQuery('');
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: string, name: string) => {
        const isSelf = memberId === currentUser?._id;
        const confirmMsg = isSelf 
            ? 'Are you sure you want to leave this board? You will lose access to all its cards.'
            : `Are you sure you want to remove ${name} from this board?`;

        if (!window.confirm(confirmMsg)) return;

        setError(null);
        setSuccessMessage(null);

        try {
            const res: any = await removeBoardMember({ id: board._id, memberId }).unwrap();
            onBoardUpdated(res.data);
            setSuccessMessage(isSelf ? 'You left the board.' : `Removed ${name} from the board.`);
            if (isSelf) {
                onClose();
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.data?.message || err.message || 'Failed to remove member');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Board Members"
            maxWidth="max-w-xl"
        >
            <div className="space-y-6 text-slate-800">
                {/* Alert Banners */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <span>⚠️</span> {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <span>✓</span> {successMessage}
                    </div>
                )}

                {/* Invite section (Owner only) */}
                {isOwner && (
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invite Collaborator</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Search user accounts by email to add them as board participants.</p>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter collaborator email..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedUser(null);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-500 rounded-xl text-xs outline-none font-medium text-slate-700 transition-colors"
                                />
                                {isSearching && (
                                    <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                                )}
                            </div>

                            {/* Search Candidate Results Dropdown */}
                            {searchResults.length > 0 && !selectedUser && (
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md max-h-40 overflow-y-auto">
                                    {searchResults.map((usr) => (
                                        <button
                                            key={usr._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedUser(usr);
                                                setSearchQuery(usr.email);
                                            }}
                                            className="w-full px-4 py-2.5 hover:bg-slate-50 text-left flex items-center gap-3 border-b border-slate-100 last:border-0 cursor-pointer"
                                        >
                                            {usr.avatar ? (
                                                <img src={usr.avatar} alt={usr.full_name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-extrabold text-[10px] flex items-center justify-center uppercase shrink-0">
                                                    {usr.full_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate">{usr.full_name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{usr.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery.trim() !== '' && searchResults.length === 0 && !isSearching && !selectedUser && (
                                <div className="text-center py-3 bg-white border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                                    No registered accounts found matching "{searchQuery}"
                                </div>
                            )}

                            {/* Confirm Selected User Button */}
                            {selectedUser && (
                                <div className="flex items-center justify-between bg-brand-50 border border-brand-100 p-3 rounded-xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-sm">
                                            {selectedUser.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-brand-900">{selectedUser.full_name}</p>
                                            <p className="text-[10px] text-brand-600 font-medium">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm cursor-pointer transition-colors flex items-center gap-1"
                                        >
                                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                                            Add to Board
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUser(null);
                                                setSearchQuery('');
                                            }}
                                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Members list */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Participants ({board.members?.length + 1})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {/* Owner item */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                            <div className="flex items-center gap-3">
                                {board.owner?.avatar ? (
                                    <img src={board.owner.avatar} alt={board.owner.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center uppercase shrink-0">
                                        {board.owner?.full_name?.charAt(0) || 'B'}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{board.owner?.full_name} {board.owner?._id === currentUser?._id && '(You)'}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{board.owner?.email}</p>
                                </div>
                            </div>
                            <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full text-[9px] font-extrabold flex items-center gap-1 uppercase tracking-wider shrink-0 shadow-sm">
                                <Crown size={10} /> Owner
                            </span>
                        </div>

                        {/* Members list items */}
                        {board.members?.map((member: any) => {
                            const isSelf = member._id === currentUser?._id;
                            
                            return (
                                <div key={member._id} className="flex items-center justify-between p-3 hover:bg-slate-50/50 border border-slate-100 rounded-xl transition-all">
                                    <div className="flex items-center gap-3">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-extrabold text-xs flex items-center justify-center uppercase shrink-0 border border-brand-100">
                                                {member.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-700 truncate">{member.full_name} {isSelf && '(You)'}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isSelf && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id, member.full_name)}
                                                className="text-red-500 hover:bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                            >
                                                Leave Board
                                            </button>
                                        )}
                                        {isOwner && !isSelf && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id, member.full_name)}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                                                title="Remove member"
                                            >
                                                <UserMinus size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {(!board.members || board.members.length === 0) && (
                            <div className="text-center py-4 text-slate-400 text-xs italic font-medium">
                                No board participants added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default BoardMembersModal;
