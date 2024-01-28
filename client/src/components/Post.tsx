import { ChangeEvent, useEffect, useState } from "react";
import { CiStickyNote } from "react-icons/ci";
import pagebookAPI from "../apis/pagebook_api";
import { Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Post() {
    const [postForm, setPostForm] = useState<boolean>(false);
    const [text, setText] = useState<{ title: string, description?: string }>({
        title: ""
    });
    const [file, setFile] = useState<File[]>([]);
    const [progressBar, setProgressBar] = useState<number>(0);
    const [snack, setSnack] = useState<{ action: boolean, message?: string }>({action: false});
    const { t } = useTranslation();

    const handlerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {
            for (let i = 0; i < files?.length; i++) {
                const f = files[i];
                setFile(prev => [...prev, f]);
            }
        }

        setText(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handlerSubmit = async () => {
        try {
            const formData = new FormData();

            if (file.length > 0) {
                for (let i = 0; i < file.length; i++) {
                    formData.append("image", file[i]);
                }
            }

            formData.append("title", text.title);
            if (text.description) {
                formData.append("description", text.description);
            }

            if (text.title.length === 0) return;

            const response = await pagebookAPI.post("post", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (process) => {
                    if (process.total) {
                        const progress = Math.round((process.loaded / process.total) * 100);
                        setProgressBar(progress);
                    }
                }
            });
            setPostForm(false);
            setFile([]);
            setText({description: "", title: ""});

            setSnack({ action: true, message: response.data.message });
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        if (snack.action) {
            setTimeout(() => setSnack({ action: false }), 5000);
        }
    }, [snack.action]);

    return (
        <>
            <div onClick={() => setPostForm(true)} className="rounded-full h-[96px] w-[96px] bg-white border-2 border-black fixed bottom-8 right-8 shadow-lg hover:bg-slate-200 transition-colors cursor-pointer z-50 flex justify-center items-center">
                <CiStickyNote className="text-6xl" />
            </div>
            <div className={`fixed ${postForm ? "bottom-0" : "bottom-[-100%]"} right-0 overflow-hidden bg-white h-[512px] w-full max-w-96 border-t-2 border-s-2 border-black rounded-tl-2xl flex flex-col justify-start items-center z-50 transition-all`}>
                {
                    progressBar > 0 && <progress className="w-full text-black h-4 bg-black z-50" value={progressBar} max={100} />
                }
                <div className="w-[94%] mx-auto">
                    <input onChange={handlerChange} className="border-2 border-black w-full text-lg mt-4 p-2 rounded-full" value={text.title || ""} type="text" placeholder={t("title")} name="title" id="title" />
                </div>
                <div className="w-[94%] mx-auto">
                    <input onChange={handlerChange} className="border-2 border-black w-full text-lg mt-4 p-2 rounded-full" value={text.description || ""} type="text" placeholder={t("description")} name="description" id="description" />
                </div>
                <div className="w-[94%] mx-auto grid grid-cols-3 mt-4 gap-2">
                    {
                        file.map((value, index) => (
                            <div onClick={() => {
                                const newFile = file.filter((_value, _index) => index !== _index);
                                setFile(newFile);
                            }} key={index} className="h-32 w-full">
                                <img className="w-full h-full" src={URL.createObjectURL(value)} />
                            </div>
                        ))
                    }
                    {
                        file.length >= 5 ? null : (
                            <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                                <div className="flex flex-col items-center justify-center pt-7">
                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">{t("selectaPhoto")}</p>
                                </div>
                                <input type="file" onChange={handlerChange} className="opacity-0" />
                            </label>
                        )
                    }
                </div>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setPostForm(false)} className="w-[128px] font-bold text-black bg-white hover:bg-slate-200 transition-all py-2 mt-4 cursor-pointer rounded-2xl">{t("close")}</button>
                    <button className="w-[128px] font-bold text-white bg-black py-2 mt-4 cursor-pointer rounded-2xl" onClick={() => handlerSubmit()}>{t("post")}</button>
                </div>
            </div>
            <Snackbar
                open={snack.action}
                message={snack.message}
            />
        </>
    );
}