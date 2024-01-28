import { Router } from "express";

import { deleteFollower, follow, getFollower, getFollowing, getMany, getOne, unFollow } from "../controllers";
import { needUserId } from "../middlerwares";

const router = Router();

// Find accounts on web app.
router.get("/", getMany);
// Find follow in account
router.get("/follower/",
    needUserId,
    getFollower
);
router.get("/following/",
    needUserId,
    getFollowing
);
// Following handle
router.get("/follow/:userId",
    needUserId,
    follow
);
// Unfollow handle
router.get("/unfollow/:userId",
    needUserId,
    unFollow
);
// Delete follower handle
router.get("/deletefollower/:userId", 
    needUserId,
    deleteFollower
);

router.get("/follower/:userId",
    getFollower
);
router.get("/following/:userId",
    getFollowing
);
router.get("/:userId", getOne);

export default router;