import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        const normalizedUrl = envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
        return `${normalizedUrl}api`;
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Helper function to extract and normalize API/Network errors
const normalizeError = (error: any) => {
    let normalized = {
        message: 'An unexpected connection issue occurred. Please check your internet connection or server status.',
        errors: [] as any[],
        status: error.response?.status || 500
    };

    if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
            normalized.message = data.message || normalized.message;
            normalized.errors = data.errors || [];
        } else if (typeof data === 'string') {
            normalized.message = data;
        }
    } else if (error.message) {
        if (error.message === 'Network Error') {
            normalized.message = 'Unable to connect to the server. Please verify if the API server is running and reachable.';
        } else {
            normalized.message = error.message;
        }
    }
    return normalized;
};

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refreshToken');

            // If no refresh token, redirect to login
            if (!refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(normalizeError(error));
            }

            if (isRefreshing) {
                // Queue this request until token is refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token endpoint directly with axios (not the api instance)
                const response = await axios.post('/api/auth/refresh-token', { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('token', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(normalizeError(error));
    }
);

export default api;
