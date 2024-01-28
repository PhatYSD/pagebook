import { Response, NextFunction } from "express";

import { RequestUser } from "./";
import { prisma } from "../utils";

export default async function needUserId(req: RequestUser, res: Response, next: NextFunction) {
    if (!req.userId) {
        return res.status(403).json({ message: "Forbidden error." });
    }

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: req.userId
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Not found user." });
        }

        req.userId = user.id;
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();

        return next();
    }
}