import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CiLogin, CiLogout } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { IoMenu, IoSettingsOutline } from "react-icons/io5";
import { FaUserPlus, FaRegUserCircle  } from "react-icons/fa";

import { authSeletor } from "../store/slice/authSlice";
import pagebookAPI from "../apis/pagebook_api";

export default function Menu() {
    const [menu, setMenu] = useState<boolean>(false);
    const { isLogin } = useSelector(authSeletor);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handlerLogout = async () => {
        try {
            await pagebookAPI.get('auth', { withCredentials: true });
            navigate(0);
        } catch (error) {
            throw error;
        }
    }

    return (
        <>
            <div onClick={() => { setMenu(prev => !prev) }} className={`fixed top-20 ${menu ? "left-[238px]" : "left-0"} w-24 h-24 z-50 bg-white rounded-e-2xl border-e-2 border-y-2 border-black hover:bg-slate-200 transition-all cursor-pointer flex justify-center items-center`}>
                <IoMenu className="text-7xl" />
            </div>
            <div className={`fixed top-20 ${menu ? "left-0" : "left-[-240px]"} h-[480px] w-[240px] bg-white rounded-br-2xl border-e-2 border-y-2 border-black z-40 transition-all overflow-hidden`}>
                {
                    isLogin.action ? (
                        <div className="w-full h-full flex flex-col justify-between items-center">
                            <div className="mt-[20px] flex flex-col justify-start items-center gap-2">
                                <img className="w-[180px] h-[180px] border-2 border-black rounded-2xl" src={isLogin.user.avatarUrl} />
                                <div className="text-xl font-bold">{isLogin.user.username}</div>
                            </div>
                            <div className="w-full flex justify-start items-center flex-col">
                                <Link reloadDocument={true} to={"/profile"} className="w-full h-16 hover:bg-slate-200 flex justify-center items-center gap-2 transition-all">
                                    <FaRegUserCircle className="text-3xl" />
                                    <span>{t("profile")}</span>
                                </Link>
                                <Link to={"/setting"} className="w-full h-16 hover:bg-slate-200 flex justify-center items-center gap-2 transition-all">
                                    <IoSettingsOutline className="text-3xl" />
                                    <span>{t("setting")}</span>
                                </Link>
                                <div onClick={() => handlerLogout()} className="w-full h-16 bg-red-500 hover:bg-red-600 flex justify-center items-center gap-2 cursor-pointer transition-all">
                                    <CiLogout className="text-3xl text-white" />
                                    <span className="text-white">{t("logout")}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-between items-center">
                            <div>
                                <h1 className="text-xl mt-4 font-bold">{t("welcomeToPagebook")}.</h1>
                                <p className="text-sm mt-4 indent-2">{t("superSocialApplication")}.</p>
                            </div>
                            <div className="w-full flex justify-start items-center flex-col">
                                <Link to={"/auth/login"} className="w-full h-16 hover:bg-slate-200 flex justify-center items-center gap-2 transition-all">
                                    <CiLogin className="text-3xl" />
                                    <span>{t("login")}</span>
                                </Link>
                                <Link to={"/auth/register"} className="w-full h-16 hover:bg-slate-200 flex justify-center items-center gap-2 transition-all">
                                    <FaUserPlus className="text-3xl" />
                                    <span>{t("register")}</span>
                                </Link>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}