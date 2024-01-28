import { useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import postSlice from "./slice/postSlice";
import authSlice from "./slice/authSlice";
import postProfileSlice from "./slice/postProfileSlice";
import profileSlice from "./slice/profileSlice"

const reducer = {
    postSlice,
    authSlice,
    postProfileSlice,
    profileSlice
}

const store = configureStore({
    reducer,
    devTools: import.meta.env.MODE === "development"
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;