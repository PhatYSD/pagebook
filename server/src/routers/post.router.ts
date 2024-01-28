import fs from "fs";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { body } from "express-validator";

import { commentPost, createPost, deleteCommentPost, deletePost, editPost, getPostMany, getPostOne, getProfile, likePost, unlikePost } from "../controllers";
import { needUserId } from "../middlerwares";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);

        cb(null, filename);
        const fullpath = path.join("uploads", filename);

        req.on("aborted", () => {
            fs.unlinkSync(fullpath);
        });
    }
});

const upload = multer({ storage });

router.post("/",
    upload.array("image", 5),
    [
        body("title").trim().notEmpty().withMessage("Title Not Empty."),
        body("description").trim(),
        body("on").trim()
    ],
    needUserId,
    createPost
);

router.get("/", getPostMany);

router.patch("/:postId",
    [
        body("title").trim(),
        body("description").trim(),
        body("on").trim()
    ],
    needUserId,
    editPost
);

router.delete("/:postId",
    needUserId,
    deletePost
);

router.get("/like/:postId",
    needUserId,
    likePost
);
router.get("/unlike/:postId",
    needUserId,
    unlikePost
);

router.get("/profile/:userId", getProfile);
router.get("/:postId", getPostOne);

router.post("/:postId/comment",
    body("message").trim().notEmpty().withMessage("Message Not Empty."),
    needUserId,
    commentPost
);

router.delete("/:postId/comment/:commentId",
    needUserId,
    deleteCommentPost
)

export default router;