import fs from "fs";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { body } from "express-validator";

import { change, deleteOne, edit, login, logout, register, reset, search } from "../controllers";
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

// Register
router.post("/register",
    upload.single("avatar"),
    [
        body("username")
            .trim()
            .notEmpty().withMessage("Username Not Empty.")
            .isLength({ min: 4, max: 16 }).withMessage("Username length between 4 to 16."),
        body("password")
            .trim()
            .notEmpty().withMessage("Password Not Empty.")
            .isLength({ min: 4 }).withMessage("Password length should be at least 4 characters.")
    ],
    register
);
// Login
router.post("/",
    body("username")
        .trim()
        .notEmpty().withMessage("Username Not Empty.")
        .isLength({ min: 4, max: 16 }).withMessage("Username length between 4 to 16."),
    body("password")
        .trim()
        .notEmpty().withMessage("Password Not Empty.")
        .isLength({ min: 4 }).withMessage("Password length should be at least 4 characters."),
    login
);
// Logout
router.get("/",
    needUserId,
    logout
);
// Edit
router.patch("/",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "background", maxCount: 1 }
    ]),
    needUserId,
    edit
);
// Remove User
router.post("/delete",
    body("password")
        .trim()
        .notEmpty().withMessage("Password Not Empty.")
        .isLength({ min: 4 }).withMessage("Password length should be at least 4 characters."),
    needUserId,
    deleteOne
);
// Reset password
router.post("/reset",
    body("password")
        .trim()
        .notEmpty().withMessage("Password Not Empty.")
        .isLength({ min: 4 }).withMessage("Password length should be at least 4 characters."),
    body("newPassword")
        .trim()
        .notEmpty().withMessage("New password Not Empty.")
        .isLength({ min: 4 }).withMessage("New password length should be at least 4 characters."),
    needUserId,
    reset
);
// Forget password
    // Search
router.post("/search",
    body("username")
        .trim()
        .notEmpty().withMessage("Username Not Empty.")
        .isLength({ min: 4, max: 16 }).withMessage("Username length between 4 to 16."),
    search
);
    // Change
router.post("/change",
    body("password")
        .trim()
        .notEmpty().withMessage("Password Not Empty.")
        .isLength({ min: 4 }).withMessage("Password length should be at least 4 characters."),
    change
);

export default router;