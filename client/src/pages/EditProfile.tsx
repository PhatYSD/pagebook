import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FaLongArrowAltRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";

import { authSeletor } from "../store/slice/authSlice";
import pagebookAPI from "../apis/pagebook_api";

export default function EditProfile() {
    const { isLogin } = useSelector(authSeletor);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [background, setBackground] = useState<File | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handlerChangeAvatar = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files;

        if (file) {
            setAvatar(file[0]);
        }
    }
    const handlerChangeBackground = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files;

        if (file) {
            setBackground(file[0]);
        }
    }

    const handlerSave = async () => {
        try {
            const formData = new FormData();
            if (avatar !== null) {
                formData.append("avatar", avatar);
            }
            if (background !== null) {
                formData.append("background", background);
            }

            const response = await pagebookAPI.patch("auth", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            if (response.status === 200) {
                location.pathname = "/profile";
            }
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        if (!isLogin.action) {
            navigate("/");
        }
    }, [isLogin.action]);

    return (
        <div className="max-w-[786px] w-full mx-auto flex flex-col justify-start items-center gap-4">
            <div className="mt-4 w-full">
                <h1 className="text-sm ms-4">{t("changeProfile")}</h1>
                <div className="w-full h-60 bg-white rounded-2xl px-8 flex justify-center sm:justify-between items-center">
                    <img className="hidden sm:block w-[200px] h-[200px] object-cover object-center border-2 border-black rounded-2xl" src={isLogin.user.avatarUrl} />
                    <FaLongArrowAltRight className="text-9xl hidden sm:block" />
                    {
                        avatar !== null ? <img onClick={() => setAvatar(null)} className="w-[200px] h-[200px] object-cover object-center border-2 border-black rounded-2xl cursor-not-allowed" src={URL.createObjectURL(avatar)} /> : (
                            <label className="flex flex-col w-[200px] h-[200px] rounded-2xl border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                                <div className="flex h-full flex-col items-center justify-center">
                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">{t("selectaPhoto")}</p>
                                </div>
                                <input type="file" onChange={handlerChangeAvatar} className="opacity-0" />
                            </label>
                        )
                    }
                </div>
            </div>
            <div className="w-full">
                <h1 className="text-sm ms-4">{t("changeBackground")}</h1>
                <div className="w-full h-60 bg-white rounded-2xl px-8 flex justify-between items-center">
                    {
                        background !== null ? <img className="w-full h-[200px] rounded-2xl border-2 border-black" src={URL.createObjectURL(background)} /> : (
                            <label className="flex flex-col w-full h-[200px] rounded-2xl border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                                <div className="flex h-full flex-col items-center justify-center">
                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">{t("selectaPhoto")}</p>
                                </div>
                                <input type="file" onChange={handlerChangeBackground} className="opacity-0" />
                            </label>
                        )
                    }
                </div>
            </div>
            <div className="mt-4 w-full h-16 bg-white rounded-2xl flex justify-between items-center">
                <Link to={"/profile"} className="h-full w-24 border-2 border-black rounded-s-2xl hover:text-lg text-black transition-all flex justify-center items-center">{t("back")}</Link>
                <button onClick={() => handlerSave()} className="h-full w-24 border-2 border-green-500 rounded-e-2xl hover:text-lg text-green-500 transition-all">{t("save")}</button>
            </div>
        </div>
    );
}