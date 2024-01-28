import { Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch } from "../store/store";
import { login, authSeletor, register, loadProfile } from "../store/slice/authSlice";

export default function Login() {
    const [cookie] = useCookies(["refreshToken", "now_login_user"]);
    const params = useParams();
    const [auth, setAuth] = useState<string>(params.method || "");
    const [form, setForm] = useState({
        username: "",
        password: "",
        repassword: ""
    });
    const [open, setOpen] = useState<{action: boolean, message: string}>({ action: false, message: "" });
    const { status, isLogin: { action } } = useSelector(authSeletor);
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handlerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
    }

    useEffect(() => {
        if (action) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        if (status === "succeeded" && cookie.refreshToken) {
            dispatch(loadProfile(cookie.now_login_user));

            navigate("/");
        }
    }, [status]);

    useEffect(() => {
        if (open.action) {
            setTimeout(() => {
                setOpen({message: "", action: false});
            }, 5000);
        }
    }, [open.action]);

    return (
        <div className="w-full h-screen flex justify-between items-center">
            <div className="flex-1 h-full bg-white hidden md:flex relative flex-col justify-center items-center overflow-hidden">
                <span className="text-7xl font-bold w-[340px]">Page</span>
                <span className="text-7xl font-bold text-end w-[340px]">Book</span>
                <div className="w-[600px] h-[600px] rounded-full bg-black absolute top-[-300px] right-[-300px]"></div>
                <div className="w-[450px] h-[450px] rounded-full bg-black absolute bottom-[-225px] left-[-225px]"></div>
            </div>
            <div className="flex-1 h-full flex justify-center items-center">
                <div className="w-[420px] h-[410px] flex justify-start items-center flex-col">
                    <div className="w-full flex-shrink-0 flex justify-between items-center border-b-4 border-black relative">
                        <div className="flex-1 text-4xl text-center my-2 z-10 cursor-pointer" onClick={() => setAuth("login")}>{t("login")}</div>
                        <div className="flex-1 text-4xl text-center my-2 z-10 cursor-pointer" onClick={() => setAuth("register")}>{t("register")}</div>
                        <div className={`absolute top-0 ${auth === "login" ? "left-0" : "left-[50%]"} bg-white h-full w-1/2 z-0 rounded-t transition-all`}></div>
                    </div>
                    <div className="w-full flex-grow relative overflow-hidden">
                        <div className={`w-full h-full flex flex-col justify-between items-center absolute top-0 ${auth === "login" ? "left-0" : "left-[-100%]"} transition-all`}>
                            <div className="w-full flex flex-col justify-start items-center">
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start gap-1">
                                    <label className="text-lg">{t("username")}</label>
                                    <input className="w-full text-center text-xl py-1 rounded-lg border-2 border-black" placeholder={t("username")} value={form.username} onChange={(event) => handlerChange(event)} type="text" name="username" id="username" />
                                </div>
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start gap-1">
                                    <label className="text-lg">{t("password")}</label>
                                    <input className="w-full text-center text-xl py-1 rounded-lg border-2 border-black" placeholder={t("password")} value={form.password} onChange={(event) => handlerChange(event)} type="text" name="password" id="password" />
                                </div>
                            </div>
                            <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start">
                                    <button disabled={status === "loading" ? true : false} onClick={() => dispatch(login({ username: form.username, password: form.password, setOpen }))} className={`w-full text-center text-white font-medium text-xl py-2 mb-4 rounded-lg bg-black ${status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}>{t("login")}</button>
                                </div>
                                <div className="text-sm">{t("forgetPassword")}</div>
                            </div>
                        </div>
                        <div className={`w-full h-full flex flex-col justify-between items-center top-0 ${auth === "login" ? "left-full" : "left-0"} absolute transition-all`}>
                            <div className="w-full flex flex-col justify-start items-center">
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start gap-1">
                                    <label className="text-lg">{t("username")}</label>
                                    <input className="w-full text-center text-xl py-1 rounded-lg border-2 border-black" placeholder={t("username")} value={form.username} onChange={(event) => handlerChange(event)} type="text" name="username" id="username" />
                                </div>
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start gap-1">
                                    <label className="text-lg">{t("password")}</label>
                                    <input className="w-full text-center text-xl py-1 rounded-lg border-2 border-black" placeholder={t("password")} value={form.password} onChange={(event) => handlerChange(event)} type="text" name="password" id="password" />
                                </div>
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start gap-1">
                                    <label className="text-lg">{t("repassword")}</label>
                                    <input className="w-full text-center text-xl py-1 rounded-lg border-2 border-black" placeholder={t("repassword")} value={form.repassword} onChange={(event) => handlerChange(event)} type="text" name="repassword" id="repassword" />
                                </div>
                            </div>
                            <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-[90%] mt-2 flex flex-col justify-center items-start">
                                    <button disabled={status === "loading" ? true : false} onClick={() => dispatch(register({...form, setOpen, setAuth}))} className={`w-full text-center text-white font-medium text-xl py-2 mb-4 rounded-lg bg-black ${status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}>{t("register")}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={open.action}
                message={open.message}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            />
        </div>
    );
}