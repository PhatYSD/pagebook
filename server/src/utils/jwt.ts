import jwt from "jsonwebtoken";

import { env } from "./";

const mode = env.NODE_ENV || "prod";

function getRefreshSecret(m: string): string {
    return m === "dev"
        ? env.JWT_SECRET_REFRESH_DEV : m === "prod"
            ? env.JWT_SECRET_REFRESH : "66859b7ade4e68cb65041b88a7ad5214df71cdcfa27dff2efcc80a81e9ba5fa0";
}

function getAccessSecret(m: string): string {
    return m === "dev"
        ? env.JWT_SECRET_ACCESS_DEV : m === "prod"
            ? env.JWT_SECRET_ACCESS : "4a30a45de74d5dd3b12c224fad569b2852025aee5d0f3fad0cc681b2ae2b8898";
}

export function sing(id: string, which: "access" | "refresh"): string {
    const payload = { id };
    const secret: string = which === "access" ? getAccessSecret(mode) : getRefreshSecret(mode);
    const option: jwt.SignOptions = which === "access" ? { expiresIn: "3m" } : { expiresIn: "15d" };

    return jwt.sign(payload, secret, option);
}

interface JwtVerify {
    id: string;
}

export function verify(token: string, which: "access" | "refresh"): JwtVerify | boolean {
    const secret: string = which === "access" ? getAccessSecret(mode) : getRefreshSecret(mode);

    try {
        const jwtVerify = jwt.verify(token, secret) as JwtVerify;

        if ("id" in jwtVerify) {
            return jwtVerify;
        }

        return false;
    } catch (error) {
        return false;
    }
}