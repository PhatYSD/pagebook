import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { authSeletor } from "../store/slice/authSlice";
import pagebookAPI from "../apis/pagebook_api";
import { Snackbar } from "@mui/material";

export default function Setting() {
    const [lang, setLang] = useState<"en" | "th">(localStorage.getItem("language") as "en");
    const [changePassword, setChangePassword] = useState<boolean>(false);
    const [deleteAccount, setDeleteAccount] = useState<{
        action: boolean,
        password: string
    }>({action: true, password: ""});
    const [cPassword, setCPassword] = useState<{ password: string, newPassword: string }>({
        password: "",
        newPassword: ""
    });
    const [snack, setSnack] = useState<{ action: boolean, message?: string }>({ action: false });
    const { isLogin } = useSelector(authSeletor);
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCPassword(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    const handlerChangePassword = async () => {
        try {
            const response = await pagebookAPI.post("auth/reset", { password: cPassword.password, newPassword: cPassword.newPassword }, {
                withCredentials: true
            });

            if (response.status === 200) {
                setSnack({ action: true, message: response.data.message });
                setChangePassword(false);
                setCPassword({ password: "", newPassword: "" });

                setTimeout(() => setSnack({ action: false }), 5000);
            }
        } catch (error: any) {
            setSnack({ action: true, message: error.response.data.message });

            setTimeout(() => setSnack({ action: false }), 5000);
        }
    }

    const handlerLogout = async () => {
        try {
            await pagebookAPI.get('auth', { withCredentials: true });
            navigate(0);
        } catch (error) {
            throw error;
        }
    }

    const handlerDeleteAccount = async () => {
        try {
            await pagebookAPI.post("auth/delete", {password: deleteAccount.password}, {
                withCredentials: true
            });
            navigate(0);
        } catch (error: any) {
            setSnack({ action: true, message: error.response.data.message });

            setTimeout(() => setSnack({ action: false }), 5000);
        }
    }

    useEffect(() => {
        localStorage.setItem("language", lang);
        i18n.changeLanguage(localStorage.getItem("language") || "en");
    }, [lang]);

    useEffect(() => {
        if (!isLogin.action) {
            navigate("/");
        }
    }, [isLogin.action]);

    return (
        <div className="max-w-[786px] w-full mx-auto flex flex-col justify-start items-center gap-4">
            <h1 className="mt-4 self-start text-lg font-bold">{t("setting")}</h1>
            <div className="w-full h-16 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                <h2 className="ms-2 font-medium">{t("editProfile")}</h2>
                <Link to={"/editprofile"} className="h-full w-24 font-medium flex justify-center items-center text-white bg-black hover:text-lg transition-all">{t("edit")}</Link>
            </div>
            <div className="w-full h-16 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                <h2 className="ms-2 font-medium">{t("likeHistory")} ({t("oncomint")}!)</h2>
                <button disabled className="h-full w-24 font-medium flex justify-center items-center text-white bg-black hover:text-lg transition-all">{t("view")}</button>
            </div>
            <div className="w-full h-16 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                <h2 className="ms-2 font-medium">{t("changeLanguage")}</h2>
                <button onClick={() => setLang(prev => {
                    if (prev === "en") {
                        return "th"
                    } else {
                        return "en"
                    }
                })} className="h-full w-24 font-medium flex justify-center items-center text-white bg-black hover:text-lg transition-all">{lang}</button>
            </div>
            <div className="w-full min-h-16">
                <div className="w-full h-16 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                    <h2 className="ms-2 font-medium">{t("changePassword")}</h2>
                    <button onClick={() => setChangePassword(prev => !prev)} className="h-full w-24 font-medium flex justify-center items-center text-white bg-black hover:text-lg transition-all">{t("change")}</button>
                </div>
                <div className={`w-[90%] mx-auto ${changePassword ? "h-16" : "h-0"} bg-white rounded-b-2xl px-4 transition-all overflow-hidden flex justify-between items-center gap-2`}>
                    <input onChange={handlerChange} className="flex-1 bg-[#f4f4f4] rounded-full text-lg p-2" type="text" placeholder={t("password")} name="password" id="password" value={cPassword.password} />
                    <input onChange={handlerChange} className="flex-1 bg-[#f4f4f4] rounded-full text-lg p-2" type="text" placeholder={t("newPassword")} name="newPassword" id="newPassword" value={cPassword.newPassword} />
                    <button onClick={() => handlerChangePassword()} className="text-lg p-2 w-16 rounded-full bg-black text-white">{t("save")}</button>
                </div>
            </div>
            <div className="w-full h-16 mt-4 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                <h2 className="ms-2 font-medium">{t("logout")}</h2>
                <button onClick={() => handlerLogout()} className="h-full w-24 font-medium flex justify-center items-center text-white bg-red-500 hover:text-lg transition-all">{t("logout")}</button>
            </div>
            <div className="w-full min-h-16">
                <div className="w-full h-16 rounded-2xl bg-white flex justify-between items-center overflow-hidden">
                    <h2 className="ms-2 font-medium">{t("deleteAccount")}</h2>
                    <button onClick={() => setDeleteAccount(prev => ({ ...prev, action: !prev.action }))} className="h-full w-24 font-medium flex justify-center items-center text-white bg-red-500 hover:text-lg transition-all">{t("delete")}</button>
                </div>
                <div className={`w-[90%] mx-auto ${deleteAccount.action ? "h-16" : "h-0"} bg-white rounded-b-2xl px-4 transition-all overflow-hidden flex justify-between items-center gap-2`}>
                    <input onChange={e => setDeleteAccount(prev => ({ ...prev, password: e.target.value }))} className="flex-1 bg-[#f4f4f4] rounded-full text-lg p-2" type="text" placeholder={t("password")} name="password" id="password" value={deleteAccount.password} />
                    <button onClick={() => handlerDeleteAccount()} className="text-lg p-2 w-20 rounded-full bg-red-500 text-white">{t("delete")}</button>
                </div>
            </div>
            <Snackbar
                open={snack.action}
                message={snack.message}
            />
        </div>
    );
}