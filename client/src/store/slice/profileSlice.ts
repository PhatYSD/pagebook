import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import pagebookAPI from "../../apis/pagebook_api";

interface InitialValue {
    user: User;
    error: null | string;
}

interface User {
    username: string;
    userId: string;
    avatarUrl: string;
    bgUrl?: string;
    followerId?: string[];
    followingId?: string[];
}

const initialValue: InitialValue = {
    user: {
        userId: "",
        username: "",
        avatarUrl: ""
    },
    error: null
}

export const loadProfile = createAsyncThunk("profile/loadProfile", async (value: string) => {
    try {
        const response = await pagebookAPI.get(`account/${value}`);

        const dataResponse: User = {
            username: response.data.data.username,
            avatarUrl: response.data.data.avatarUrl,
            userId: response.data.data.id,
            bgUrl: response.data.data?.backgroundUrl || undefined,
            followerId: response.data.data.followerId,
            followingId: response.data.data.followingId
        }

        return dataResponse;
    } catch (error) {
        throw error;
    }
});

const profileSlice = createSlice({
    name: "profile",
    initialState: initialValue,
    reducers: {
        follow: (state: InitialValue, action: PayloadAction<string>) => {
            const index = state.user.followerId?.findIndex(value => value === action.payload);

            if (index === -1) {
                state.user.followerId?.push(action.payload);
            }
        },
        unfollow: (state: InitialValue, action: PayloadAction<string>) => {
            const index = state.user.followingId?.findIndex(value => value === action.payload);

            if (index !== -1) {
                state.user.followingId = state.user.followingId?.filter(value => value !== action.payload);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadProfile.fulfilled, (state: InitialValue, action: PayloadAction<User>) => {
                state.user = action.payload;
            })
            .addCase(loadProfile.rejected, (state: InitialValue, action) => {
                state.error = action.error.message || "";
            })
    }
});

export const { follow, unfollow } = profileSlice.actions;
export const profileSeletor = (state: RootState) => state.profileSlice;
export default profileSlice.reducer;