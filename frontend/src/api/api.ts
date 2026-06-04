import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

// Track token refresh state to handle concurrent requests failing with 401
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        const normalizedUrl = envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
        return `${normalizedUrl}api`;
    }
    return '/api';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getBaseURL(),
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return result;
        }

        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                try {
                    const response = await fetch(`${getBaseURL()}/auth/refresh-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                    });
                    if (response.ok) {
                        const resJson = await response.json();
                        const newAccessToken = resJson?.data?.accessToken;
                        const newRefreshToken = resJson?.data?.refreshToken;
                        if (newAccessToken) {
                            localStorage.setItem('accessToken', newAccessToken);
                            localStorage.setItem('token', newAccessToken);
                            if (newRefreshToken) {
                                localStorage.setItem('refreshToken', newRefreshToken);
                            }
                            return newAccessToken;
                        }
                    }
                    return null;
                } catch (e) {
                    return null;
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            })();
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "Board", "List", "Card"],
    endpoints: (builder) => ({
        // ─── Authentication Endpoints ────────────────────────────────────────
        login: builder.mutation({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Board", "List", "Card"],
        }),
        register: builder.mutation({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        verifyOtp: builder.mutation({
            query: (body) => ({
                url: "/auth/verify-otp",
                method: "POST",
                body,
            }),
        }),
        forgotPassword: builder.mutation({
            query: (body) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body,
            }),
        }),
        resetPassword: builder.mutation({
            query: (body) => ({
                url: "/auth/reset-password",
                method: "POST",
                body,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["User", "Board", "List", "Card"],
        }),
        changePassword: builder.mutation({
            query: (body) => ({
                url: "/auth/change-password",
                method: "POST",
                body,
            }),
        }),
        getUserProfile: builder.query({
            query: () => ({
                url: "/auth/profile",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        updateAvatar: builder.mutation({
            query: (body) => ({
                url: "/auth/profile/avatar",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        searchUsers: builder.query({
            query: (email) => ({
                url: "/auth/search",
                method: "GET",
                params: { email },
            }),
        }),

        // ─── Board Endpoints ─────────────────────────────────────────────────
        getBoards: builder.query({
            query: () => ({
                url: "/boards",
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ _id }: any) => ({ type: "Board" as const, id: _id })),
                          { type: "Board" as const, id: "LIST" },
                      ]
                    : [{ type: "Board" as const, id: "LIST" }],
        }),
        getBoardById: builder.query({
            query: (id) => ({
                url: `/boards/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Board", id }],
        }),
        createBoard: builder.mutation({
            query: (body) => ({
                url: "/boards",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Board", id: "LIST" }],
        }),
        updateBoard: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/boards/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Board", id: "LIST" },
                { type: "Board", id },
            ],
        }),
        deleteBoard: builder.mutation({
            query: (id) => ({
                url: `/boards/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Board", id: "LIST" },
                { type: "Board", id },
            ],
        }),
        toggleStarBoard: builder.mutation({
            query: (id) => ({
                url: `/boards/${id}/star`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Board", id: "LIST" },
                { type: "Board", id },
            ],
        }),
        addBoardMember: builder.mutation({
            query: ({ id, email }) => ({
                url: `/boards/${id}/members`,
                method: "POST",
                body: { email },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Board", id }],
        }),
        removeBoardMember: builder.mutation({
            query: ({ id, memberId }) => ({
                url: `/boards/${id}/members/${memberId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Board", id }],
        }),

        // ─── List Endpoints ──────────────────────────────────────────────────
        getListsByBoard: builder.query({
            query: (boardId) => ({
                url: `/lists/board/${boardId}`,
                method: "GET",
            }),
            providesTags: (result, error, boardId) => [
                { type: "List", id: `board-${boardId}` },
                { type: "List", id: "LIST" },
            ],
        }),
        createList: builder.mutation({
            query: (body) => ({
                url: "/lists",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { board_id }) => [
                { type: "List", id: `board-${board_id}` },
                { type: "List", id: "LIST" },
            ],
        }),
        updateList: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/lists/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["List"],
        }),
        deleteList: builder.mutation({
            query: (id) => ({
                url: `/lists/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["List"],
        }),
        reorderLists: builder.mutation({
            query: (body) => ({
                url: "/lists/reorder",
                method: "POST",
                body,
            }),
            invalidatesTags: ["List"],
        }),

        // ─── Card Endpoints ──────────────────────────────────────────────────
        getCardsByBoard: builder.query({
            query: (boardId) => ({
                url: `/cards/board/all`,
                method: "GET",
                params: { board_id: boardId },
            }),
            providesTags: (result, error, boardId) => [
                { type: "Card", id: `board-${boardId}` },
                { type: "Card", id: "LIST" },
            ],
        }),
        getCardsByList: builder.query({
            query: (listId) => ({
                url: `/cards/list/${listId}`,
                method: "GET",
            }),
            providesTags: (result, error, listId) => [
                { type: "Card", id: `list-${listId}` },
                { type: "Card", id: "LIST" },
            ],
        }),
        getCardById: builder.query({
            query: (id) => ({
                url: `/cards/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Card", id }],
        }),
        createCard: builder.mutation({
            query: (body) => ({
                url: "/cards",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { board_id }) => [
                { type: "Card", id: `board-${board_id}` },
                { type: "Card", id: "LIST" },
            ],
        }),
        updateCard: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/cards/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Card", id },
                { type: "Card", id: "LIST" },
            ],
        }),
        deleteCard: builder.mutation({
            query: (id) => ({
                url: `/cards/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Card"],
        }),
        moveCard: builder.mutation({
            query: (body) => ({
                url: "/cards/move",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Card"],
        }),
        reorderCards: builder.mutation({
            query: (body) => ({
                url: "/cards/reorder",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Card"],
        }),
        addCardActivity: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/cards/${id}/activities`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Card", id },
                { type: "Card", id: "LIST" },
            ],
        }),
        updateCardActivity: builder.mutation({
            query: ({ cardId, activityId, ...body }) => ({
                url: `/cards/${cardId}/activities/${activityId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { cardId }) => [
                { type: "Card", id: cardId },
                { type: "Card", id: "LIST" },
            ],
        }),
        deleteCardActivity: builder.mutation({
            query: ({ cardId, activityId }) => ({
                url: `/cards/${cardId}/activities/${activityId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { cardId }) => [
                { type: "Card", id: cardId },
                { type: "Card", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOtpMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useLogoutMutation,
    useChangePasswordMutation,
    useGetUserProfileQuery,
    useUpdateAvatarMutation,
    useLazySearchUsersQuery,
    useSearchUsersQuery,
    useGetBoardsQuery,
    useGetBoardByIdQuery,
    useCreateBoardMutation,
    useUpdateBoardMutation,
    useDeleteBoardMutation,
    useToggleStarBoardMutation,
    useAddBoardMemberMutation,
    useRemoveBoardMemberMutation,
    useGetListsByBoardQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
    useReorderListsMutation,
    useGetCardsByBoardQuery,
    useGetCardsByListQuery,
    useGetCardByIdQuery,
    useCreateCardMutation,
    useUpdateCardMutation,
    useDeleteCardMutation,
    useMoveCardMutation,
    useReorderCardsMutation,
    useAddCardActivityMutation,
    useUpdateCardActivityMutation,
    useDeleteCardActivityMutation,
} = api;
