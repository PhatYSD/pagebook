import { Router } from "express";

import { searchBar } from "../controllers"

const router = Router();

router.get("/", searchBar);

export default router;