import { Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { BeatLoader } from "react-spinners";
import { BsThreeDots } from "react-icons/bs";
import { Fade } from "react-slideshow-image";
import { BiSolidLike } from "react-icons/bi";
import { SlUserFollow } from "react-icons/sl";
import { useTranslation } from "react-i18next";
import { RiUserFollowFill } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { FaCommentAlt, FaEdit } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Comment } from "../components";
import NoImage from "../assets/no-image.png";
import pagebookAPI from "../apis/pagebook_api";
import { useAppDispatch } from "../store/store";
import { authSeletor } from "../store/slice/authSlice";
import { Comment as IComment } from "../store/slice/postSlice";
import { loadProfile, profileSeletor, follow, unfollow } from "../store/slice/profileSlice";
import { getProfilePost, postProfileSeletor, like, unlike, deletePost } from "../store/slice/postProfileSlice";

export default function Profile() {
    const dispatch = useAppDispatch();
    const params = useParams();
    const [page, setPage] = useState<number>(1);
    const [comment, setComment] = useState<{ action: boolean, postId: string, comments: IComment[] }>({
        action: false,
        postId: "",
        comments: []
    });
    const [text, setText] = useState<{ title: string, description?: string }>({
        title: ""
    });
    const [file, setFile] = useState<File[]>([]);
    const [snack, setSnack] = useState<{ action: boolean, message?: string }>({ action: false });
    const { status, data } = useSelector(postProfileSeletor);
    const [option, setOption] = useState<{ action: boolean, postId?: string }>({ action: false });
    const { isLogin } = useSelector(authSeletor);
    const { user } = useSelector(profileSeletor);
    const targetLoad = useRef<null | HTMLDivElement>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handlerLike = async (postId: string) => {
        try {
            const response = await pagebookAPI.get(`/post/like/${postId}`, { withCredentials: true });
            if (response.status === 200) {
                dispatch(like({ postId, userId: isLogin.user.userId }))
            }
        } catch (error) {
            throw error;
        }
    }
    const handlerUnlike = async (postId: string) => {
        try {
            const response = await pagebookAPI.get(`/post/unlike/${postId}`, { withCredentials: true });
            if (response.status === 200) {
                dispatch(unlike({ postId, userId: isLogin.user?.userId as string }))
            }
        } catch (error) {
            throw error;
        }
    }

    const handlerDelete = async (postId: string) => {
        try {
            const response = await pagebookAPI.delete(`post/${postId}`, { withCredentials: true });

            if (response.status === 204) {
                dispatch(deletePost(postId));
                setSnack(prev => ({ ...prev, message: "Delete successfully.", action: true }));

                setTimeout(() => setSnack(prev => ({ ...prev, action: false, message: undefined })), 5000);
            }
        } catch (error) {
            throw error;
        }
    }

    const handlerFollow = async (userId: string) => {
        try {
            const response = await pagebookAPI.get(`account/follow/${userId}`, { withCredentials: true });

            if (response.status === 200) {
                dispatch(follow(userId));
            }
        } catch (error) {
            throw error;
        }
    }
    const handlerUnFollow = async (userId: string) => {
        try {
            const response = await pagebookAPI.get(`account/unfollow/${userId}`, { withCredentials: true });

            if (response.status === 200) {
                dispatch(unfollow(userId));
            }
        } catch (error) {
            throw error;
        }
    }

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {
            for (let i = 0; i < files?.length; i++) {
                const f = files[i];
                setFile(prev => [...prev, f]);
            }
        }

        setText(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handlerProfile = () => {
        const formData = new FormData();

        formData.append("on", "profile");
        handlerPost(formData);
    }
    const handlerPublic = () => {
        const formData = new FormData();

        handlerPost(formData);
    }

    const handlerPost = async (formData: FormData) => {
        try {
            if (file.length > 0) {
                for (let i = 0; i < file.length; i++) {
                    formData.append("image", file[i]);
                }
            }

            formData.append("title", text.title);
            if (text.description) {
                formData.append("description", text.description);
            }

            const response = await pagebookAPI.post("post", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setFile([]);
            setText({description: "", title: ""});

            setSnack({ action: true, message: response.data.message });
            navigate(0);
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        if (params.userId) {
            dispatch(loadProfile(params.userId));
        }

        if (isLogin.user.userId || params.userId) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        dispatch(getProfilePost({ userId: params.userId ? params.userId : isLogin.user.userId, page, setPage }));
                    }
                });
            }, {
                threshold: 0.5
            });

            if (targetLoad.current) {
                observer.observe(targetLoad.current);
            }

            return () => {
                observer.disconnect();
            };
        }
    }, [isLogin.user.userId, page, params.userId]);

    return (
        <div className="w-full">
            <div style={{
                backgroundImage: `url(${user.bgUrl ? user.bgUrl : isLogin.user.bgUrl ? isLogin.user.bgUrl : NoImage})`
            }} className="w-full h-[312px] object-cover bg-no-repeat bg-black flex justify-end items-center">
                <img src={user.avatarUrl ? user.avatarUrl : isLogin.user.avatarUrl} className="h-[200px] w-[200px] object-cover border-2 border-black mx-12 bg-white rounded-2xl" />
            </div>
            <div className="w-full px-4 flex justify-between items-center h-20">
                <div className="text-2xl font-bold">{user.username ? user.username : isLogin.user.username}</div>
                <div className="flex justify-end items-center gap-4">
                    <div className={`h-16 w-64 rounded-2xl bg-gradient-to-r from-black to-white flex justify-between items-center`}>
                        <div className="h-full flex-1 flex justify-center items-center font-semibold text-white hover:text-sm transition-all cursor-pointer">{(user.followerId ? user.followerId?.length : isLogin.user.followerId?.length) || 0} {t("follower")}</div>
                        <hr className="h-full border-2 border-black" />
                        <div className="h-full flex-1 flex justify-center items-center font-semibold text-black hover:text-sm transition-all cursor-pointer">{(user.followingId ? user.followingId?.length : isLogin.user.followingId?.length) || 0} {t("following")}</div>
                    </div>
                    {
                        user.userId && user.userId !== isLogin.user.userId ? (
                            <>
                                {
                                    user.followerId?.includes(isLogin.user.userId) ? (
                                        <div onClick={() => {handlerUnFollow(user.userId);navigate}} className="h-16 w-16 bg-black flex justify-center items-center rounded-2xl text-5xl active:text-4xl transition-all cursor-pointer">
                                            <RiUserFollowFill className="text-white" />
                                        </div>
                                    ) : (
                                        <div onClick={() => {handlerFollow(user.userId);navigate(0);}} className="h-16 w-16 bg-black flex justify-center items-center rounded-2xl text-5xl active:text-4xl transition-all cursor-pointer">
                                            <SlUserFollow className="text-white" />
                                        </div>
                                    )
                                }
                            </>
                        ) : (
                            <Link to={"/editprofile"} className="h-16 w-16 bg-black flex justify-center items-center rounded-2xl text-5xl active:text-4xl transition-all cursor-pointer">
                                <FaEdit className="text-white" />
                            </Link>
                        )
                    }
                </div>
            </div>
            <div className="my-4 w-full max-w-[786px] mx-auto flex flex-col justify-start items-center gap-4">
                {
                    (!user.userId || (isLogin.user.userId === user.userId)) && (
                        <div className="w-full bg-white rounded-2xl overflow-hidden">
                            <div className="h-16 flex gap-2 ps-2 justify-start items-center border-b-2 border-black">
                                <div className="h-10 w-10 rounded-full bg-black overflow-hidden">
                                    <img loading="lazy" className="object-cover h-full w-full" src={isLogin.user.avatarUrl} alt="profile" />
                                </div>
                                <div className="font-bold">{isLogin.user.username}</div>
                            </div>
                            <div className="h-16 px-2 gap-2 flex justify-between items-center">
                                <input onChange={handlerChange} className="flex-1 text-lg p-2 rounded-full outline-none bg-[#f4f4f4]" value={text.title} type="text" placeholder={t("title")} name="title" id="title" />
                                <input onChange={handlerChange} className="flex-1 text-lg p-2 rounded-full outline-none bg-[#f4f4f4]" value={text.description} type="text" placeholder={t("description")} name="description" id="description" />
                                <label className="w-20 relative py-2 rounded-full bg-black text-white flex justify-center items-center text-lg font-semibold z-10 overflow-hidden">
                                    {t("image")}
                                    <input disabled={file.length >= 5} onChange={handlerChange} className="opacity-0 absolute top-0 left-0" type="file" />
                                </label>
                            </div>
                            <div className="h-16 w-full flex items-center justify-between border-t-2 border-black overflow-hidden">
                                <div onClick={() => handlerProfile()} className="flex-1 hover:bg-slate-200 transition-colors text-lg flex justify-center items-center h-full cursor-pointer">{t("profilePost")}</div>
                                <hr className="border border-black h-full" />
                                <div onClick={() => handlerPublic()} className="flex-1 hover:bg-slate-200 transition-colors text-lg flex justify-center items-center h-full cursor-pointer">{t("publicPost")}</div>
                            </div>
                        </div>
                    )
                }
                {
                    data.map(post => (
                        <div key={post.id} className="w-full h-auto bg-white rounded-2xl">
                            <div className="h-16 flex justify-between items-center border-b-2 border-black">
                                <div className="h-full flex justify-start gap-2 items-center ms-2">
                                    <div className="h-10 w-10 rounded-full bg-black overflow-hidden">
                                        <img loading="lazy" className="object-cover h-full w-full" src={post.avatarUrl} alt="profile" />
                                    </div>
                                    <div className="font-bold">{post.username}</div>
                                </div>
                                <div className="me-2">
                                    {
                                        post.userId === isLogin.user?.userId ? (
                                            <div onClick={() => setOption({ action: !option.action, postId: post.id })} className="relative">
                                                <BsThreeDots className="text-4xl cursor-pointer" />
                                                {
                                                    (option.action && option.postId === post.id) && <div onClick={() => handlerDelete(post.id)} className="absolute top-full right-0 bg-white h-8 w-20 border-2 border-red-500 text-red-500 rounded-lg flex justify-center items-center cursor-pointer">{t("delete")}</div>
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                            <div className="w-full mt-2">
                                <div className="w-full px-4">
                                    <div className="text-lg font-normal">{post.title}</div>
                                    <div className="indent-4 font-light">{post.description}</div>
                                </div>
                                <div className="w-full mb-2">
                                    {
                                        post.imageUrls.length !== 0 ?
                                            post.imageUrls.length === 1 ? (<div>
                                                <img loading="lazy" src={post.imageUrls[0]} alt={post.title} className="w-full" />
                                            </div>) : (
                                                <Fade>
                                                    {post.imageUrls.map((value, index) => (
                                                        <div key={index + value}>
                                                            <img loading="lazy" className="w-full max-h-[420px] object-contain" src={value} />
                                                        </div>
                                                    ))}
                                                </Fade>
                                            )
                                            : null
                                    }
                                </div>
                            </div>
                            <div className="h-16 w-full flex items-center justify-between border-t-2 border-black overflow-hidden">
                                {
                                    post.likeBy.some(value => value.userId === isLogin.user?.userId) ? (
                                        <div onClick={() => handlerUnlike(post.id)} className="flex-1 h-full flex justify-center items-center text-blue-500 text-3xl gap-2 rounded-bl-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                            <BiSolidLike />
                                            <span>{post.like}</span>
                                        </div>
                                    ) : (
                                        <div onClick={() => handlerLike(post.id)} className="flex-1 h-full flex justify-center items-center text-3xl gap-2 rounded-bl-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                            <BiSolidLike />
                                            <span>{post.like}</span>
                                        </div>
                                    )
                                }
                                <hr className="border border-black h-full" />
                                <div onClick={() => setComment(prev => ({ ...prev, action: true, postId: post.id, comments: post.comment }))} className="flex-1 flex justify-center h-full items-center text-2xl gap-2 rounded-br-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                    <FaCommentAlt />
                                    <span className="text-3xl">{post.comment.length}</span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            {
                status === "failed" ? <div className="my-4 w-full text-center">{t("fullContent")}.</div> : (
                    <div ref={targetLoad} className="w-full flex justify-center items-center my-4">
                        <BeatLoader color="#000000" />
                    </div>
                )
            }
            {
                comment.action && <Comment comment={comment} setComment={setComment} />
            }
            <Snackbar
                open={snack.action}
                message={snack.message}
            />
        </div>
    );
}