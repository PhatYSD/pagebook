import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import "./apis/i18n";
import store from "./store/store";
import Main from "./layouts/Main";
import { Auth, EditProfile, Home, Profile, Setting } from "./pages";
import "react-slideshow-image/dist/styles.css";


const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Main />,
            children: [
                {
                    path: "/",
                    element: <Home />
                },
                {
                    path: "/profile",
                    element: <Profile />
                },
                {
                    path: "/profile/:userId",
                    element: <Profile />
                },
                {
                    path: "/editprofile",
                    element: <EditProfile />
                },
                {
                    path: "/setting",
                    element: <Setting />
                }
            ]
        },
        {
            path: "/auth/:method",
            element: <Auth />
        }
    ]
);

ReactDOM.createRoot(document.getElementById("root")!)
    .render(
        <React.StrictMode>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </React.StrictMode>
    );