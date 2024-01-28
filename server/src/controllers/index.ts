type Auth = {
    username: string,
    password: string
}

type Post = {
    title: string;
    description?: string;
    on: string | "public";
    like: number | 0;
    userId?: string;
}

const baseurlGCS = "https://storage.googleapis.com/pagebook_bucket/";

export { register, login, logout, edit, deleteOne, reset, search, change } from "./auth.rlledrsc";
export { getMany, getOne, getFollower, getFollowing, follow, unFollow, deleteFollower } from "./account.4gfud";
export { createPost, getPostMany, getPostOne, getProfile, editPost, deletePost, likePost, unlikePost, commentPost, deleteCommentPost } from "./post.c3gedlu";
export { searchBar } from "./search";
export { Auth, Post, baseurlGCS }