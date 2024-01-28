import express, { Request, Response } from "express";

import { accountRouter, authRouter, postRouter, searchRouter } from "./routers";

const app = express();

app.get("/api", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "Welcome to pagebook api." });
});

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/post", postRouter);
app.use("/api/search", searchRouter);

export default app;