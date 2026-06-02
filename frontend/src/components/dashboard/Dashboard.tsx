import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/useAuthStore';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setBoards, setLoading, setError } from '../../store/boardSlice';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import StatCard from './StatCard';
import BoardCard from './BoardCard';
import CreateBoardModal from './CreateBoardModal';
import SettingsModal from './SettingsModal';
import { 
    Plus, 
    Clock, 
    Star, 
    FolderKanban,
    Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { boards, loading, error } = useAppSelector((state) => state.board);
    const { user, updateUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'boards' | 'starred' | 'recent'>('boards');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardColor, setNewBoardColor] = useState('linear-gradient(135deg, #0c87eb 0%, #00f2fe 100%)');
    const [isCreating, setIsCreating] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [greeting, setGreeting] = useState('');
    
    const navigate = useNavigate();
 
    const fetchBoards = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const response: any = await api.get('/boards');
            dispatch(setBoards(response.data || []));
        } catch (err: any) {
            dispatch(setError(err.message || 'Failed to fetch boards'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchBoards();
        
        // Setup greeting based on time of day
        const hr = new Date().getHours();
        if (hr < 12) setGreeting('Good morning');
        else if (hr < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, [dispatch]);

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardTitle.trim()) return;

        setIsCreating(true);
        try {
            await api.post('/boards', {
                title: newBoardTitle,
                background_color: newBoardColor
            });
            setNewBoardTitle('');
            setIsModalOpen(false);
            fetchBoards();
        } catch (err) {
            console.error('Failed to create board:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
        e.stopPropagation(); // prevent navigating to board
        if (!window.confirm('Are you sure you want to delete this board?')) return;

        try {
            await api.delete(`/boards/${boardId}`);
            fetchBoards();
        } catch (err) {
            console.error('Failed to delete board:', err);
        }
    };

    const handleToggleStar = async (e: React.MouseEvent, boardId: string) => {
        e.stopPropagation();
        try {
            await api.put(`/boards/${boardId}/star`);
            fetchBoards();
        } catch (err) {
            console.error('Failed to toggle star:', err);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploadingAvatar(true);
        try {
            const res: any = await api.put('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data);
        } catch (error) {
            console.error('Failed to upload avatar', error);
            alert('Failed to upload avatar.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleLogout = async () => {
        await useAuthStore.getState().logout();
        navigate('/login');
    };

    const starredBoards = boards.filter((board) => board.starredBy?.includes(user?._id));
    
    const filteredBoards = boards
        .filter((board) => {
            if (activeTab === 'starred') {
                return board.starredBy?.includes(user?._id);
            }
            return true;
        })
        .filter((board) => board.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (activeTab === 'recent') {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            return 0; // maintain default order if not 'recent'
        });

    // Premium Color and Gradient presets
    const presets = [
        { value: 'linear-gradient(135deg, #0c87eb 0%, #00f2fe 100%)', label: 'Ocean Blue' },
        { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Mint Glow' },
        { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Warm Flame' },
        { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset Glow' },
        { value: 'linear-gradient(135deg, #89609e 0%, #e879f9 100%)', label: 'Purple Haze' },
        { value: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', label: 'Strawberry' },
        { value: '#0079bf', label: 'Trello Blue' },
        { value: '#519839', label: 'Forest Green' },
        { value: '#b04632', label: 'Burgundy' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans">
            {/* Sidebar */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
                onLogout={handleLogout} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header */}
                <DashboardHeader 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    onOpenSettings={() => setIsSettingsOpen(true)} 
                    user={user} 
                />

                <div className="p-6 lg:p-10 flex-1">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 lg:p-8 text-white mb-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
                        {/* Glow highlights */}
                        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/20 rounded-full blur-[80px] -mr-20 -mt-20" />
                        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-purple-500/15 rounded-full blur-[70px] -mb-20" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-brand-300 backdrop-blur-md mb-3">
                                    <Sparkles size={12} /> Live Workspace
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight">{greeting}, {user?.full_name.split(' ')[0] || 'User'}!</h2>
                                <p className="text-slate-300 text-sm mt-1 max-w-md">Let's coordinate tasks, hit milestones, and elevate team productivity together today.</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-brand-500 to-sky-400 hover:from-brand-600 hover:to-sky-500 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <Plus size={20} /> Create Board
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <StatCard 
                            title="Total Boards" 
                            value={boards.length} 
                            icon={<FolderKanban size={24} />} 
                        />
                        <StatCard 
                            title="Starred Boards" 
                            value={starredBoards.length} 
                            icon={<Star size={24} fill="currentColor" />} 
                            bgClass="bg-yellow-50" 
                            textClass="text-yellow-500" 
                        />
                        <StatCard 
                            title="Workspace Status" 
                            value="Active" 
                            icon={<Clock size={24} />} 
                            bgClass="bg-emerald-50" 
                            textClass="text-emerald-500" 
                        />
                    </div>

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-800">
                                {activeTab === 'starred' ? 'Starred Boards' : activeTab === 'recent' ? 'Recent Boards' : 'All Boards'}
                            </h3>
                            <p className="text-slate-400 text-xs mt-0.5">Filter, search, or navigate your active board screens</p>
                        </div>
                        
                        {/* Tab filters for mobile */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl lg:hidden">
                            <button 
                                onClick={() => setActiveTab('boards')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'boards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                            >
                                All
                            </button>
                            <button 
                                onClick={() => setActiveTab('starred')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'starred' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                            >
                                Starred
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {error ? (
                        <div className="text-center py-16 px-6 bg-red-50/50 border border-red-200/60 rounded-3xl animate-in fade-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4 text-xl">
                                <span>⚠️</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Workspace Sync Failed</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">{error}</p>
                            <button 
                                onClick={fetchBoards}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer active:scale-95"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : filteredBoards.length === 0 && searchTerm === '' ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/50">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-full mb-4 text-brand-500">
                                <span className="text-2xl font-bold">📋</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">No boards found</h3>
                            <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">Create your first board to start managing tasks and drag-and-drop lists.</p>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-500/10"
                            >
                                <Plus size={20} /> Create First Board
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                            {filteredBoards.map((board: any) => (
                                <BoardCard 
                                    key={board._id} 
                                    board={board} 
                                    userId={user?._id} 
                                    onClick={() => navigate(`/board/${board._id}`)} 
                                    onToggleStar={(e) => handleToggleStar(e, board._id)} 
                                    onDelete={(e) => handleDeleteBoard(e, board._id)} 
                                />
                            ))}
                            
                            {/* Create Button Card */}
                            <div 
                                onClick={() => setIsModalOpen(true)}
                                className="h-44 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-white hover:bg-brand-50/20 flex flex-col items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer text-slate-400 hover:text-brand-500 shadow-sm"
                            >
                                <div className="p-3 bg-slate-50 group-hover:bg-brand-100 rounded-2xl text-slate-500 group-hover:text-brand-600 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Create New Board</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Board Modal */}
            <CreateBoardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateBoard} 
                newBoardTitle={newBoardTitle} 
                setNewBoardTitle={setNewBoardTitle} 
                newBoardColor={newBoardColor} 
                setNewBoardColor={setNewBoardColor} 
                isCreating={isCreating} 
                presets={presets} 
            />

            {/* Settings Modal */}
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                user={user} 
                isUploadingAvatar={isUploadingAvatar} 
                onAvatarUpload={handleAvatarUpload} 
                onChangePassword={() => {
                    setIsSettingsOpen(false);
                    navigate('/change-password');
                }} 
                onLogout={() => {
                    setIsSettingsOpen(false);
                    handleLogout();
                }} 
            />
        </div>
    );
};

export default Dashboard;
