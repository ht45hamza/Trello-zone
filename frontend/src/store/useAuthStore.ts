import { create } from 'zustand';
import { api } from '../api/api';
import { store } from './index';

interface AuthState {
    user: any | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    setAuth: (user: any, accessToken: string, refreshToken?: string) => void;
    logout: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    checkAuth: () => Promise<void>;
    updateUser: (user: any) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('accessToken') || localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!(localStorage.getItem('accessToken') || localStorage.getItem('token')),
    loading: false,
    error: null,

    setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, token: accessToken, refreshToken: refreshToken || null, isAuthenticated: true, error: null });
    },

    logout: async () => {
        try {
            await store.dispatch(api.endpoints.logout.initiate(undefined)).unwrap();
        } catch (err) {

        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    updateUser: (user) => set({ user }),

    checkAuth: async () => {
        const token = get().token;
        if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        try {
            set({ loading: true });
            const response: any = await store.dispatch(api.endpoints.getUserProfile.initiate(undefined)).unwrap();
            set({ user: response.data, isAuthenticated: true, error: null });
        } catch (error: any) {
            console.error("Failed to fetch profile", error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    }
}));

export default useAuthStore;
