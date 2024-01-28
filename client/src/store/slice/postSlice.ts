import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import pagebookAPI from "../../apis/pagebook_api";

interface InitialState {
    status: "idle" | "loading" | "succeeded" | "failed";
    data: Data[];
    error: string | null;
}

export interface Comment {
    message: string;
    userId: string;
    username: string;
    avatarUrl: string;
}

interface LikeBy {
    userId: string;
    username?: string;
    avatarUrl?: string;
}

interface Data {
    id: string;
    userId: string;
    title: string;
    description?: string;
    on: string;
    imageUrls: string[];
    like: number;
    likeBy: LikeBy[];
    comment: Comment[];
    updatedAt: Date;
    createdAt: Date;
    username: string;
    avatarUrl: string;
}

const initialState: InitialState = {
    status: "idle",
    data: [],
    error: null
}

interface FetchPost {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>
}

export const fetchPost = createAsyncThunk("post/fetchPost", async (value: FetchPost) => {
    try {
        const response = await pagebookAPI.get(`post?page=${value.page}`);
        value.setPage(prev => prev + 1);

        if (response.status === 204) {
            throw new Error("Full content.");
        }

        return response.data.data;
    } catch (error) {
        throw error;
    }
});

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        like: (state: InitialState, action: PayloadAction<{ postId: string, userId: string }>) => {
            const { postId, userId } = action.payload;

            const post = state.data.find(value => value.id === postId);

            if (post) {
                const existingLike = post.likeBy.find(value => value.userId === userId);

                if (!existingLike) {
                    post.likeBy.push({ userId, username: "", avatarUrl: "" });
                    post.like++;
                }
            }
        },
        unlike: (state: InitialState, action: PayloadAction<{ postId: string, userId: string }>) => {
            const { postId, userId } = action.payload;

            const post = state.data.find(value => value.id === postId);

            if (post) {
                post.likeBy = post.likeBy.filter(value => value.userId !== userId);
                post.like--;
            }
        },
        createComment: (state: InitialState, action: PayloadAction<{ postId: string, message: string, avatarUrl: string, username: string }>) => {
            const { postId, message, avatarUrl, username } = action.payload;

            const post = state.data.find(value => value.id === postId);

            if (post) {
                const newComment = { userId: username, username, avatarUrl, message };

                post.comment = [...post.comment, newComment];
            }
        },
        deletePost: (state: InitialState, action: PayloadAction<string>) => {
            state.data = state.data.filter(value => value.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPost.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPost.fulfilled, (state, action: PayloadAction<Data[]>) => {
                state.status = "succeeded";
                const data = [...state.data, ...action.payload];
                state.data = data;
            })
            .addCase(fetchPost.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? "";
            });
    }
});

export const { like, unlike, createComment, deletePost } = postSlice.actions;
export const postSelector = (state: RootState) => state.postSlice;
export default postSlice.reducer;