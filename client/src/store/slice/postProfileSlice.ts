import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import pagebookAPI from "../../apis/pagebook_api";

interface InitialValue {
    data: Data[],
    status: "idle" | "loading" | "succeeded" | "failed";
    error: null | string
}

interface Data {
    id: string;
    title: string;
    imageUrls: string[];
    description?: string;
    userId: string;
    username: string;
    avatarUrl: string;
    like: number;
    likeBy: {
        username: string;
        avatarUrl: string;
        userId: string;
    }[];
    on: string;
    comment: {
        message: string;
        userId: string;
        username: string;
        avatarUrl: string;
    }[];
}

const initialValue: InitialValue = {
    status: "idle",
    error: null,
    data: []
};

interface Value {
    userId: string;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>
}

export const getProfilePost = createAsyncThunk("postProfile/getProfilePost", async (value: Value) => {
    try {
        const response = await pagebookAPI.get(`post/profile/${value.userId}?page=${value.page}`);
        value.setPage(prev => prev + 1);

        if (response.status === 204) {
            throw new Error("Full content.");
        }

        return response.data.data as Data[];
    } catch (error) {
        throw error;
    }
});

const postProfileSlice = createSlice({
    name: "postProfile",
    reducers: {
        like: (state: InitialValue, action: PayloadAction<{ postId: string, userId: string }>) => {
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
        unlike: (state: InitialValue, action: PayloadAction<{ postId: string, userId: string }>) => {
            const { postId, userId } = action.payload;

            const post = state.data.find(value => value.id === postId);

            if (post) {
                post.likeBy = post.likeBy.filter(value => value.userId !== userId);
                post.like--;
            }
        },
        deletePost: (state: InitialValue, action: PayloadAction<string>) => {
            state.data = state.data.filter(value => value.id !== action.payload);
        }
    },
    initialState: initialValue,
    extraReducers: (builder) => {
        builder
            .addCase(getProfilePost.pending, (state: InitialValue) => {
                state.status = "loading";
            })
            .addCase(getProfilePost.fulfilled, (state: InitialValue, action: PayloadAction<Data[]>) => {
                state.status = "succeeded";
                const data = [...state.data, ...action.payload];
                state.data = data;
            })
            .addCase(getProfilePost.rejected, (state: InitialValue, action) => {
                state.status = "failed";
                state.error = action.error.message || "";
            });
    }
});

export const { like, unlike, deletePost } = postProfileSlice.actions;
export const postProfileSeletor = (state: RootState) => state.postProfileSlice;
export default postProfileSlice.reducer;