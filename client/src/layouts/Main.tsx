import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import { Menu, Navbar } from "../components";
import { useAppDispatch } from "../store/store";
import { loadProfile } from "../store/slice/authSlice";

const Main = () => {
    const dispatch = useAppDispatch();
    const [cookies] = useCookies(["now_login_user", "refreshToken"]);
    const { i18n } = useTranslation();
 
    useEffect(() => {
        if (cookies.refreshToken) {
            dispatch(loadProfile(cookies.now_login_user));
        }
        i18n.changeLanguage(localStorage.getItem("language") || "en");
    }, []);

    return (
        <>
            <Navbar />
            <Menu />
            <div className="pt-[60px] w-full">
                <div className="container w-full max-w-[1024px] mx-auto">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Main;