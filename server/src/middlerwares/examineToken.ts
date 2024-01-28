import { Request, Response, NextFunction } from "express";

import { sing, verify } from "../utils";

export interface RequestUser extends Request {
    userId?: string;
}

interface Verify {
    id: string;
}

export default function examineToken(req: RequestUser, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const accessVerify = verify(accessToken, "access") as Verify;
    const refreshVerify = verify(refreshToken, "refresh") as Verify;

    if (!refreshVerify) {
        return next();
    }

    const { id } = refreshVerify;
    res.cookie("now_login_user", id );
    
    if (accessVerify) {
        const { id } = accessVerify;
        req.userId = id;
        
        return next();
    }

    const newAccessToken = sing(id, "access");

    res.cookie("accessToken", newAccessToken, {
        maxAge: 1000 * 60 * 5,
        secure: true,
        httpOnly: true,
        sameSite: "none"
    });

    req.userId = id;

    return next();
}