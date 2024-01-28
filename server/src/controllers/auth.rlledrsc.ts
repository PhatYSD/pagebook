import fs from "fs";
import path from "path";
import { Response, Request } from "express";
import { matchedData, validationResult } from "express-validator";

import { Auth, baseurlGCS } from ".";
import { compare, hash, pagebookBucket, sing, verify, prisma } from "../utils";
import { RequestUser } from "../middlerwares";

export async function register(req: Request, res: Response) {
    const errors = validationResult(req);

    const cacheData: string[] = [];

    res.once("finish", () => {
        cacheData.forEach(async value => await fs.promises.unlink(value));
    });

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { username, password } = matchedData(req) as Auth;

    try {
        await prisma.$connect();

        const file = {
            filename: "",
            fullpath: "",
            url: ""
        };

        if (req.file) {
            file.filename = req.file.filename;
            file.fullpath = path.join(__dirname, "../../uploads", file.filename);
            cacheData.push(file.fullpath);
        } else {
            file.filename = Date.now() + path.extname("default_profile.jpg");
            file.fullpath = path.join(__dirname, "../../uploads", "default_profile.jpg");
        }

        await new Promise(async (resolve, reject) => {
            const readStream = fs.createReadStream(file.fullpath);
            const writeFile = pagebookBucket.file(file.filename).createWriteStream({
                resumable: false,
                gzip: true
            });
            file.url = `${baseurlGCS}${file.filename}`;

            readStream.pipe(writeFile);
            writeFile.on("error", reject);
            writeFile.on("finish", resolve);
        });

        const hashPassword = await hash(password);

        await prisma.user.create({
            data: {
                username,
                passwort: hashPassword,
                avatar: {
                    create: {
                        url: file.url
                    }
                }
            }
        });

        return res.status(201).json({ message: "Create a new user successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function login(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { username, password } = matchedData(req) as Auth;

    try {
        await prisma.$connect();

        const user = await prisma.user.findUniqueOrThrow({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!await compare(password, user.passwort)) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const refreshToken = sing(user.id, "refresh");

        res.cookie("refreshToken", refreshToken,
            {
                maxAge: 1000 * 60 * 60 * 24 * 30
            }
        );
        if (!req.cookies.default_user_frist_login) {
            res.cookie("default_user_frist_login", user.id);
        }
        res.cookie("now_login_user", user.id);
        return res.status(200).json({ message: "Login is successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function logout(req: RequestUser, res: Response) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    res.cookie("accessToken", accessToken, {
        maxAge: 0,
        httpOnly: true
    });
    res.cookie("refreshToken", refreshToken, {
        maxAge: 0,
        httpOnly: true
    });
    res.cookie("now_login_user", "", {
        maxAge: 0,
        httpOnly: true
    });

    return res.status(204).json({ message: "Logout successful" });
}

interface Files {
    [fieldname: string]: Express.Multer.File[];
}

export async function edit(req: RequestUser, res: Response) {
    const { userId } = req;
    const cacheData: string[] = [];

    res.once("finish", () => {
        cacheData.forEach(async value => await fs.promises.unlink(value));
    });

    try {
        await prisma.$connect();

        if (req.files) {
            const avatarFile = (req.files as Files)["avatar"]?.[0];

            if (avatarFile) {
                const fullpath = path.join(__dirname, "..", "..", "uploads", avatarFile.filename);
                const readFile = fs.createReadStream(fullpath); cacheData.push(fullpath);
                const writeFile = pagebookBucket.file(avatarFile.filename).createWriteStream({
                    resumable: false,
                    gzip: true
                });

                await new Promise(async (resolve, reject) => {
                    readFile.pipe(writeFile);
                    writeFile.on("error", reject);
                    writeFile.on("finish", async () => {
                        await prisma.avatar.update({
                            where: { userId }, data: {
                                url: `${baseurlGCS}${avatarFile.filename}`
                            }
                        });
                        resolve(null);
                    });
                });
            }

            const backgroundFile = (req.files as { [fieldname: string]: Express.Multer.File[] })["background"]?.[0];

            if (backgroundFile) {
                const fullpath = path.join(__dirname, "..", "..", "uploads", backgroundFile.filename);
                const readFile = fs.createReadStream(fullpath); cacheData.push(fullpath);
                const writeFile = pagebookBucket.file(backgroundFile.filename).createWriteStream({
                    resumable: false,
                    gzip: true
                });

                await new Promise(async (resolve, reject) => {
                    readFile.pipe(writeFile);
                    writeFile.on("error", reject);
                    writeFile.on("finish", async () => {
                        const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { background: true } });
                        if (user.background) {
                            await prisma.background.update({
                                where: { userId }, data: {
                                    url: `${baseurlGCS}${backgroundFile.filename}`
                                }
                            });
                        } else {
                            await prisma.background.create({
                                data: {
                                    url: `${baseurlGCS}${backgroundFile.filename}`,
                                    userId: user.id
                                }
                            });
                        }
                    });

                    resolve(null);
                });
            }

            return res.status(200).json({ message: "Updated successfully." });
        }
        return res.status(400).json({ message: "Not updated." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function deleteOne(req: RequestUser, res: Response) {
    const { userId } = req;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { password } = matchedData(req) as Auth;

    try {
        await prisma.$connect();

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                follower: {
                    include: {
                        FollowerFollowing: true
                    }
                },
                following: {
                    include: {
                        FollowerFollowing: true
                    }
                },
                liked: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Not found this user." });
        }

        if (!await compare(password, user.passwort)) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const likedId: number[] = [];

        user.liked.forEach(async value => {
            const posts = await prisma.post.update({
                where: {
                    id: value.postId
                },
                data: {
                    like: {
                        decrement: 1
                    }
                },
                select: {
                    id: true,
                    likeBy: {
                        select: {
                            id: true
                        }
                    }
                }
            });

            posts.likeBy.forEach(value => likedId.push(value.id));
        });

        likedId.forEach(async value => {
            await prisma.like.delete({
                where: {
                    id: value
                }
            });
        });

        const ffId: string[] = [];

        user.follower.forEach(async value => {
            ffId.push(value.FollowerFollowing.id);
            console.log(value.FollowerFollowing.id);

            await prisma.followerFollowing.update({
                where: { id: value.FollowerFollowing.id }, data: {
                    followerId: {
                        delete: true
                    },
                    followingId: {
                        delete: true
                    }
                }
            });
        });
        user.following.forEach(async value => {
            ffId.push(value.FollowerFollowing.id);

            await prisma.followerFollowing.update({
                where: { id: value.FollowerFollowing.id }, data: {
                    followerId: {
                        delete: true
                    },
                    followingId: {
                        delete: true
                    }
                }
            });
        });
        const post = await prisma.post.findMany({ where: { userId: user.id } });
        post.forEach(async value => {
            await prisma.image.deleteMany({ where: { postId: value.id } });
        });

        await prisma.avatar.deleteMany({ where: { userId } });
        await prisma.background.deleteMany({ where: { userId } });
        await prisma.comment.deleteMany({ where: { userId } });
        await prisma.followerFollowing.deleteMany({
            where: {
                id: {
                    in: ffId
                }
            }
        });
        await prisma.like.deleteMany({ where: { userId } });
        await prisma.post.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });

        res.cookie("refreshToken", req.cookies.refreshToken, { maxAge: 0, httpOnly: true });
        res.cookie("accessToken", req.cookies.accessToken, { maxAge: 0, httpOnly: true });

        return res.sendStatus(204);
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

interface AuthReset extends Auth {
    newPassword: string;
}

export async function reset(req: RequestUser, res: Response) {
    const { userId } = req;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { password, newPassword } = matchedData(req) as AuthReset;

    try {
        await prisma.$connect();

        const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "Not found this user." });
        }

        if (!await compare(password, user.passwort)) {
            return res.status(401).json({ message: "Invalid password." });
        }

        await prisma.user.update({
            where: { id: user.id }, data: {
                passwort: await hash(newPassword)
            }
        });

        return res.status(200).json({ message: "Reset password successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function search(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { username } = matchedData(req);

    try {
        await prisma.$connect();

        const user = await prisma.user.findUniqueOrThrow({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "Not found this user." });
        }

        const resetPasswordToken = sing(user.id, "access");

        res.cookie("resetPasswordToken", resetPasswordToken);
        return res.status(200).json({ message: "Create reset password token successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function change(req: Request, res: Response) {
    const resetPasswordToken = req.cookies.resetPasswordToken;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    if (!resetPasswordToken) {
        return res.status(403).json({ message: "Forbidden error." });
    }

    const { password } = matchedData(req) as Auth;

    try {
        await prisma.$connect();

        const { id } = verify(resetPasswordToken, "access") as { id: string };

        const user = await prisma.user.findUniqueOrThrow({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "Not found this user." });
        }

        await prisma.user.update({
            where: { id: user.id }, data: {
                passwort: await hash(password)
            }
        });

        res.cookie("resetPasswordToken", resetPasswordToken, { maxAge: 0, httpOnly: true });
        return res.status(200).json({ message: "Reset password successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}