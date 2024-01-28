import { useState } from "react";
import { Link } from "react-router-dom";
import { IoCloseSharp, IoSend } from "react-icons/io5";

import { useSelector } from "react-redux";
import pagebookAPI from "../apis/pagebook_api";
import { useAppDispatch } from "../store/store";
import { authSeletor } from "../store/slice/authSlice";
import { Comment as IComment, createComment } from "../store/slice/postSlice";

interface Props {
    comment: { action: boolean, postId: string, comments: IComment[] }
    setComment: React.Dispatch<React.SetStateAction<{ action: boolean, postId: string, comments: IComment[] }>>
}

export default function Comment({ setComment, comment }: Props) {
    const [message, setMessage] = useState<string>("");
    const { isLogin: { user } } = useSelector(authSeletor);
    const dispatch = useAppDispatch();

    const handlerSend = async () => {
        try {
            const response = await pagebookAPI.post(`post/${comment.postId as string}/comment`, { message }, { withCredentials: true });
            dispatch(createComment({username: user.username, avatarUrl: user.avatarUrl, message, postId: comment.postId}));
            setComment(prev => ({...prev, comments: [...prev.comments, {...user, message}]}));

            setMessage("");
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    return (
        <div onClick={() => setComment(prev => ({ ...prev, action: false }))} className="w-screen h-screen bg-white bg-opacity-15 flex justify-center items-center fixed top-0 left-0 z-50">
            <div onClick={(e) => e.stopPropagation()} className="w-full h-full max-h-[480px] max-w-[784px] rounded-2xl bg-white border-2 border-black relative flex justify-between items-center flex-col">
                <IoCloseSharp onClick={() => setComment(prev => ({ ...prev, action: false }))} className="text-4xl text-red-400 hover:text-red-600 transition-colors cursor-pointer absolute top-4 right-4" />
                <div className="flex-1 p-4 w-full flex flex-col justify-start items-center gap-2 scroll-smooth overflow-y-auto">
                    {
                        comment?.comments.map((value, index) => (
                            <div key={value.userId+comment.postId+index} className="w-[96%] flex flex-col justify-center items-start gap-2">
                                <div className="flex justify-start items-center gap-2">
                                    <img className="h-8 w-8 bg-black rounded-full" src={value.avatarUrl} />
                                    <Link onClick={() => setComment(prev => ({...prev, action: false}))} reloadDocument={true} to={`/profile/${value.userId}`}>{value.username}</Link>
                                </div>
                                <div className="w-full">
                                    <div className="mx-10 p-2 border-2 border-black rounded-lg">{value.message}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="w-[90%] mb-4 flex justify-start items-center gap-4">
                    <input onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            handlerSend();
                        }
                    }} onChange={(e) => setMessage(e.target.value)} value={message || ""} className="w-full p-2 rounded-full border-2 border-black" name="message" id="message" placeholder="Message..." type="text" />
                    <IoSend onClick={() => handlerSend()} className="text-4xl cursor-pointer" />
                </div>
            </div>
        </div>
    );
}