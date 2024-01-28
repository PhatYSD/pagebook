import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import pagebookAPI from "../../apis/pagebook_api";

interface InitialValue {
    isLogin: {
        action: boolean,
        user: User
    }
    status: "idle" | "loading" | "succeeded" | "failed";
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
    isLogin: {
        action: false,
        user: {
            userId: "",
            username: "",
            avatarUrl: ""
        }
    },
    status: "idle",
    error: null
}

interface Login {
    username: string;
    password: string;
    setOpen: React.Dispatch<React.SetStateAction<{ action: boolean, message: string }>>;
}

interface Register extends Login {
    repassword: string;
    setAuth: React.Dispatch<React.SetStateAction<string>>;
}

export const login = createAsyncThunk("auth/login", async (value: Login) => {
    try {
        const response = await pagebookAPI.post("/auth", value, { withCredentials: true });
        value.setOpen({ message: response.data.message, action: true });

        return response.data;
    } catch (error: any) {
        value.setOpen({ message: error.response.data.message, action: true });
        throw error;
    }
});

export const register = createAsyncThunk("auth/register", async (value: Register) => {
    try {
        const response = await pagebookAPI.post("/auth/register", { username: value.username, password: value.password, repassword: value.repassword }, { withCredentials: true });
 
        value.setAuth("login");

        return response.data;
    } catch (error: any) {
        value.setOpen({ message: error.response.data.message, action: true });
        throw error;
    }
});

export const loadProfile = createAsyncThunk("auth/loadProfile", async (value: string) => {
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

const authSlice = createSlice({
    name: "auth",
    initialState: initialValue,
    reducers: {
        follow: (state: InitialValue, action: PayloadAction<string>) => {
            const index = state.isLogin.user.followingId?.findIndex(value => value === action.payload);

            if (index === -1) {
                state.isLogin.user.followingId?.push(action.payload);
            }
        },
        unfollow: (state: InitialValue, action: PayloadAction<string>) => {
            const index = state.isLogin.user.followingId?.findIndex(value => value === action.payload);

            if (index !== -1) {
                state.isLogin.user.followingId = state.isLogin.user.followingId?.filter(value => value !== action.payload);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state: InitialValue) => {
                state.status = "loading";
            })
            .addCase(login.fulfilled, (state: InitialValue) => {
                state.isLogin.action = true;
                state.status = "succeeded";
            })
            .addCase(login.rejected, (state, action) => {
                state.isLogin.action = false;
                state.status = "failed";
                state.error = action.error.message || "";
            })
            .addCase(register.pending, (state: InitialValue) => {
                state.status = "loading";
            })
            .addCase(register.fulfilled, (state: InitialValue) => {
                state.status = "succeeded";
            })
            .addCase(register.rejected, (state: InitialValue, action) => {
                state.status = "failed";
                state.error = action.error.message || "";
            })
            .addCase(loadProfile.fulfilled, (state: InitialValue, action: PayloadAction<User>) => {
                state.isLogin.user = action.payload;
                state.isLogin.action = true;
            })
            .addCase(loadProfile.rejected, (state: InitialValue, action) => {
                state.status = "failed";
                state.error = action.error.message || "";
            })
    }
})

export const { follow, unfollow } = authSlice.actions;
export const authSeletor = (state: RootState) => state.authSlice;
export default authSlice.reducer;