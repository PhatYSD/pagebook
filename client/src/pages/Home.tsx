import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BeatLoader } from "react-spinners";
import { Fade } from "react-slideshow-image";
import { BiSolidLike } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";
import { FaCommentAlt } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { Snackbar } from "@mui/material";

import { Comment, Post } from "../components";
import pagebookAPI from "../apis/pagebook_api";
import { useAppDispatch } from "../store/store";
import { authSeletor, follow } from "../store/slice/authSlice";
import { fetchPost, postSelector, like, unlike, Comment as IComment, deletePost } from "../store/slice/postSlice";
import { useTranslation } from "react-i18next";

export default function Home() {
    const dispatch = useAppDispatch();
    const post = useSelector(postSelector);
    const [page, setPage] = useState<number>(1);
    const [option, setOption] = useState<{ action: boolean, postId?: string }>({ action: false });
    const [comment, setComment] = useState<{ action: boolean, postId: string, comments: IComment[] }>({
        action: false,
        postId: "",
        comments: []
    });
    const [snack, setSnack] = useState<{ action: boolean, message?: string }>({action: false});
    const { isLogin: { user, action } } = useSelector(authSeletor);
    const targetLoad = useRef<null | HTMLDivElement>(null);
    const { t } = useTranslation();

    const handlerLike = async (postId: string) => {
        try {
            const response = await pagebookAPI.get(`/post/like/${postId}`, { withCredentials: true });
            if (response.status === 200) {
                dispatch(like({ postId, userId: user?.userId as string }))
            }
        } catch (error) {
            throw error;
        }
    }
    const handlerUnlike = async (postId: string) => {
        try {
            const response = await pagebookAPI.get(`/post/unlike/${postId}`, { withCredentials: true });
            if (response.status === 200) {
                dispatch(unlike({ postId, userId: user?.userId as string }))
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

    const handlerDelete = async (postId: string) => {
        try {
            const response = await pagebookAPI.delete(`post/${postId}`, { withCredentials: true });

            if (response.status === 204) {
                dispatch(deletePost(postId));
                setSnack(prev => ({...prev, message: "Delete successfully.", action: true}));

                setTimeout(() => setSnack(prev => ({...prev, action: false, message: undefined})), 5000);
            }
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    dispatch(fetchPost({ page, setPage }));
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
    }, [page]);

    return (
        <>
            <div className="mt-4 w-full max-w-[786px] mx-auto flex flex-col justify-start items-center gap-4">
                {
                    post.data.map(value => (
                        <div key={value.id} className="w-full h-auto bg-white rounded-2xl">
                            <div className="h-16 flex justify-between items-center border-b-2 border-black">
                                <div className="h-full flex justify-start gap-2 items-center ms-2">
                                    <div className="h-10 w-10 rounded-full bg-black overflow-hidden">
                                        <img loading="lazy" className="object-cover h-full w-full" src={value.avatarUrl} alt="profile" />
                                    </div>
                                    <Link reloadDocument={true} to={`/profile/${value.userId}`} className="font-bold hover:underline">{value.username}</Link>
                                </div>
                                <div className="me-2">
                                    {
                                        value.userId === user?.userId ? (
                                            <div onClick={() => setOption({action: !option.action, postId: value.id})} className="relative">
                                                <BsThreeDots className="text-4xl cursor-pointer" />
                                                {
                                                    (option.action && option.postId === value.id) && <div onClick={() => handlerDelete(value.id)} className="absolute top-full right-0 bg-white h-8 w-20 border-2 border-red-500 text-red-500 rounded-lg flex justify-center items-center cursor-pointer">{t("delete")}</div>
                                                }
                                            </div>
                                        ) : user.followingId?.includes(value.userId) ? null : (
                                            <button onClick={() => handlerFollow(value.userId)} className="h-[30px] w-[60px] bg-black text-white font-medium rounded-md text-base">{t("follow")}</button>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="w-full mt-2">
                                <div className="w-full px-4">
                                    <div className="text-lg font-normal">{value.title}</div>
                                    <div className="indent-4 font-light">{value.description}</div>
                                </div>
                                <div className="w-full mb-2">
                                    {
                                        value.imageUrls.length !== 0 ?
                                            value.imageUrls.length === 1 ? (<div>
                                                <img loading="lazy" src={value.imageUrls[0]} alt={value.title} className="w-full" />
                                            </div>) : (
                                                <Fade>
                                                    {value.imageUrls.map((value, index) => (
                                                        <div key={index + value}>
                                                            <img loading="lazy" className="w-full max-h-[420px] object-contain" src={value} />
                                                        </div>
                                                    ))}
                                                </Fade>
                                            )
                                            : null
                                    }
                                </div>
                                <div className="h-16 w-full flex items-center justify-between border-t-2 border-black overflow-hidden">
                                    {
                                        value.likeBy.some(value => value.userId === user?.userId) ? (
                                            <div onClick={() => handlerUnlike(value.id)} className="flex-1 h-full flex justify-center items-center text-blue-500 text-3xl gap-2 rounded-bl-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                                <BiSolidLike />
                                                <span>{value.like}</span>
                                            </div>
                                        ) : (
                                            <div onClick={() => handlerLike(value.id)} className="flex-1 h-full flex justify-center items-center text-3xl gap-2 rounded-bl-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                                <BiSolidLike />
                                                <span>{value.like}</span>
                                            </div>
                                        )
                                    }
                                    <hr className="border border-black h-full" />
                                    <div onClick={() => setComment(prev => ({...prev, action: true, postId: value.id, comments: value.comment}))} className="flex-1 flex justify-center h-full items-center text-2xl gap-2 rounded-br-2xl cursor-pointer hover:bg-slate-200 transition-colors">
                                        <FaCommentAlt />
                                        <span className="text-3xl">{value.comment.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            {
                post.status === "failed" ? <div className="my-4 w-full text-center">{t("fullContent")}.</div> : (
                    <div ref={targetLoad} className="w-full flex justify-center items-center my-4">
                        <BeatLoader color="#000000" />
                    </div>
                )
            }
            {
                comment.action && <Comment comment={comment} setComment={setComment} />
            }
            {
                action ? <Post /> : null
            }
            <Snackbar
                open={snack.action}
                message={snack.message}
            />
        </>
    )
}