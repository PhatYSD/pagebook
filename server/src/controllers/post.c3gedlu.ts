import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

import { RequestUser } from "../middlerwares";
import { Post, baseurlGCS } from ".";
import { pagebookBucket, prisma } from "../utils";

export async function createPost(req: RequestUser, res: Response) {
    const { userId } = req;
    const errors = validationResult(req);

    if (!errors.isEmpty() || !userId) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { title, description, on } = matchedData(req) as Post;

    try {
        await prisma.$connect();
        const post = await prisma.post.create({
            data: {
                userId,
                title,
                description,
                on: on || "public"
            }
        });

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(201).json({ message: "Create post successfully." });
        }

        await Promise.all(files.map(async value => {
            const readFile = fs.createReadStream(path.join("uploads", value.filename));
            const writeFile = pagebookBucket.file(value.filename).createWriteStream({
                resumable: false,
                gzip: true
            });

            await new Promise((resolve, reject) => {
                readFile.pipe(writeFile);
                writeFile.on("error", error => {
                    reject(error);
                });
                writeFile.on("finish", async () => {
                    await prisma.image.create({
                        data: {
                            postId: post.id,
                            url: `${baseurlGCS}${value.filename}`
                        }
                    });
                    await fs.promises.unlink(path.join("uploads", value.filename));

                    resolve(null);
                });
            });
        }));

        return res.status(201).json({ message: "Create post successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

interface Comment {
    message: string;
    userId: string;
    username: string;
    avatarUrl: string;
}

interface LikeBy {
    userId: string;
    username: string;
    avatarUrl: string;
}

interface DataResponse {
    id: string;
    userId: string;
    title: string;
    description?: string;
    on: string;
    imageUrls: string[];
    like: number;
    likeBy: LikeBy[];
    comment: Comment[];
    updatedAt: Date;
    createdAt: Date;
    username: string;
    avatarUrl: string;
}

export async function getPostMany(req: Request, res: Response) {
    let page = parseInt(req.query.page as string) || 1;

    try {
        prisma.$connect();
        const postAmount = await prisma.post.count();
        if (page > Math.ceil(postAmount / 5.0)) {
            return res.sendStatus(204);
        }
        const ports = await prisma.post.findMany({
            where: {
                on: "public"
            },
            include: {
                comment: {
                    select: {
                        message: true,
                        userId: true
                    }
                },
                image: {
                    select: {
                        url: true
                    }
                },
                likeBy: {
                    select: {
                        userId: true
                    }
                },
                User: {
                    select: {
                        username: true,
                        avatar: {
                            select: {
                                url: true
                            }
                        }
                    }
                }
            },
            take: 5,
            skip: (page - 1) * 5,
            orderBy: {
                updatedAt: "desc"
            }
        });

        const dataResponse: DataResponse[] = await Promise.all(ports.map(async value => {
            const imageUrls: string[] = value.image.map(value => value.url);
            const likeBys = await prisma.like.findMany({
                where: {
                    postId: value.id
                },
                select: {
                    userId: true,
                    User: {
                        select: {
                            username: true,
                            avatar: {
                                select: {
                                    url: true
                                }
                            }
                        }
                    }
                }
            });
            const likeBy: LikeBy[] = likeBys.map(value => {
                return {
                    userId: value.userId,
                    avatarUrl: value.User.avatar?.url as string,
                    username: value.User.username
                }
            });
            const comments = await prisma.comment.findMany({
                where: {
                    postId: value.id
                },
                select: {
                    id: true,
                    message: true,
                    userId: true,
                    User: {
                        select: {
                            username: true,
                            avatar: {
                                select: {
                                    url: true
                                }
                            }
                        }
                    }
                }
            });

            const commentF: Comment[] = comments.map(value => {
                return {
                    userId: value.userId,
                    username: value.User.username as string,
                    avatarUrl: value.User.avatar?.url as string,
                    message: value.message as string,
                    commentId: value.id
                }
            });

            return {
                id: value.id,
                userId: value.userId,
                title: value.title,
                description: value.description || "",
                on: value.on,
                imageUrls,
                like: value.like,
                likeBy: likeBy,
                comment: commentF,
                updatedAt: value.updatedAt,
                createdAt: value.createdAt,
                username: value.User.username,
                avatarUrl: value.User.avatar?.url as string
            }
        }));

        return res.status(200).json({ message: "Find posts successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function getPostOne(req: Request, res: Response) {
    const { postId } = req.params;

    try {
        await prisma.$connect();
        const post = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            },
            select: {
                image: {
                    select: {
                        url: true
                    }
                },
                id: true,
                updatedAt: true,
                createdAt: true,
                description: true,
                on: true,
                userId: true,
                title: true,
                like: true,
                likeBy: {
                    select: {
                        userId: true,
                        User: {
                            select: {
                                avatar: {
                                    select: {
                                        url: true
                                    }
                                },
                                username: true
                            }
                        }
                    }
                },
                comment: {
                    select: {
                        message: true,
                        id: true,
                        userId: true,
                        User: {
                            select: {
                                username: true,
                                avatar: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    }
                },
                User: {
                    select: {
                        username: true,
                        avatar: {
                            select: {
                                url: true
                            }
                        }
                    }
                }
            }
        });

        const dataResponse: DataResponse = {
            id: post.id,
            userId: post.userId,
            title: post.title,
            description: post.description || "",
            on: post.on,
            imageUrls: post.image.map(value => value.url),
            like: post.like,
            likeBy: post.likeBy.map(value => {
                return {
                    userId: value.userId,
                    avatarUrl: value.User.avatar?.url as string,
                    username: value.User.username
                }
            }),
            comment: post.comment.map(value => {
                return {
                    userId: value.userId,
                    avatarUrl: value.User.avatar?.url as string,
                    message: value.message,
                    username: value.User.username,
                    commentId: value.id
                }
            }),
            updatedAt: post.updatedAt,
            createdAt: post.createdAt,
            username: post.User.username,
            avatarUrl: post.User.avatar?.url as string
        };

        return res.status(200).json({ message: "Find post successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

interface ProfileResponse {
    id: string;
    title: string;
    imageUrls: string[];
    description?: string;
    userId: string;
    username: string;
    avatarUrl: string;
    like: number;
    likeBy: {
        username: string;
        avatarUrl: string;
        userId: string;
    }[];
    on: string;
    comment: {
        message: string;
        userId: string;
        username: string;
        avatarUrl: string;
    }[];
}

export async function getProfile(req: Request, res: Response) {
    const { userId } = req.params;
    let page = parseInt(req.query.page as string) || 1;

    try {
        await prisma.$connect();

        const postAmount = await prisma.post.count();
        if (page > Math.ceil(postAmount / 5.0)) {
            return res.sendStatus(204);
        }

        const posts = await prisma.post.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                image: {
                    select: {
                        url: true
                    }
                },
                userId: true,
                User: {
                    select: {
                        username: true,
                        avatar: {
                            select: {
                                url: true
                            }
                        }
                    }
                },
                like: true,
                likeBy: {
                    select: {
                        userId: true,
                        User: {
                            select: {
                                avatar: {
                                    select: {
                                        url: true
                                    }
                                },
                                username: true
                            }
                        }
                    }
                },
                on: true,
                comment: {
                    select: {
                        message: true,
                        userId: true,
                        User: {
                            select: {
                                username: true,
                                avatar: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 5,
            skip: (page - 1)  * 5,
            orderBy: {
                updatedAt: "desc"
            }
        });

        // @ts-ignore
        const dataResponse: ProfileResponse[] = posts.map(value => {
            return {
                userId: value.userId,
                id: value.id,
                title: value.title,
                description: value.description,
                imageUrls: value.image.map(imgUrl => imgUrl.url),
                username: value.User.username,
                avatarUrl: value.User.avatar?.url as string,
                like: value.like,
                likeBy: value.likeBy.map(likeby => {
                    return {
                        username: likeby.User.username,
                        avatarUrl: likeby.User.avatar?.url as string,
                        userId: likeby.userId
                    }
                }),
                on: value.on,
                comment: value.comment.map(com => {
                    return {
                        message: com.message,
                        userId: com.userId,
                        avatarUrl: com.User.avatar?.url as string,
                        username: com.User.username
                    }
                })
            }
        });

        return res.status(200).json({ message: "Find profile post successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function editPost(req: RequestUser, res: Response) {
    const { userId } = req;
    const { postId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    if (!postId || !userId) {
        return res.status(400).json({ message: "Invalid postId or userId." });
    }

    const { title, description, on } = matchedData(req) as Post;

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                post: true
            }
        });
        if (user.post.findIndex(value => value.id === postId) !== -1) {
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    title,
                    description,
                    on
                }
            });

            return res.status(200).json({ message: "Edit successfully." });
        }

        return res.status(401).json({ message: "This user not have this post." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function deletePost(req: RequestUser, res: Response) {
    const { userId } = req;
    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ message: "Invalid postId." });
    }

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            include: {
                post: true
            }
        });

        if (user.post.findIndex(value => value.id === postId) === -1) {
            return res.status(404).json({ message: "This user not have this post." });
        }

        await prisma.image.deleteMany({ where: { postId } });
        await prisma.comment.deleteMany({ where: { postId } });
        await prisma.like.deleteMany({ where: { postId } });
        await prisma.post.delete({ where: { id: postId } });

        return res.sendStatus(204);
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function likePost(req: RequestUser, res: Response) {
    const { userId } = req;
    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                liked: {
                    select: {
                        id: true
                    }
                }
            }
        });
        const post = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            },
            include: {
                likeBy: {
                    select: {
                        id: true
                    }
                }
            }
        });

        for (const value of user.liked) {
            for (const value2 of post.likeBy) {
                if (value.id === value2.id) {
                    return res.status(400).json({ message: "You are liked." });
                }
            }
        }

        await prisma.like.create({
            data: {
                postId: post.id,
                userId: user.id
            }
        });
        await prisma.post.update({
            where: {
                id: post.id
            },
            data: {
                like: {
                    increment: 1
                }
            }
        });

        return res.status(200).json({ message: "Like successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function unlikePost(req: RequestUser, res: Response) {
    const { userId } = req;
    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                liked: {
                    select: {
                        id: true
                    }
                }
            }
        });
        const post = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            },
            include: {
                likeBy: {
                    select: {
                        id: true
                    }
                }
            }
        });

        for (const value of user.liked) {
            for (const value2 of post.likeBy) {
                if (value.id === value2.id) {
                    await prisma.like.deleteMany({
                        where: {
                            AND: {
                                userId: user.id,
                                postId: post.id
                            }
                        }
                    });

                    await prisma.post.update({
                        where: {
                            id: post.id
                        },
                        data: {
                            like: {
                                decrement: 1
                            }
                        }
                    });

                    return res.status(200).json({ message: "Unlike successfully." });
                }
            }
        }

        return res.status(400).json({ message: "You are don't like." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

// comment system
export async function commentPost(req: RequestUser, res: Response) {
    const errors = validationResult(req);
    const { userId } = req;
    const { postId } = req.params;

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    if (!postId) {
        return res.status(400).json({ message: "Invalid post ID." });
    }

    const { message } = matchedData(req) as { message: string };

    try {
        await prisma.$connect();
        const post = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            }
        });

        await prisma.comment.create({
            data: {
                message,
                postId: post.id,
                userId: userId as string
            }
        });

        return res.status(201).json({ message: "Comment successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function deleteCommentPost(req: RequestUser, res: Response) {
    const { commentId, postId } = req.params;
    const { userId } = req;

    if (!commentId || !postId) {
        return res.status(200).json({ message: "Invalid values." })
    }

    try {
        await prisma.$connect();
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            select: {
                comment: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (user.comment.findIndex(value => value.id === parseInt(commentId)) === -1) {
            return res.status(403).json({ message: "Not your comment." });
        }
        await prisma.comment.deleteMany({
            where: {
                AND: {
                    postId,
                    id: parseInt(commentId),
                    userId
                }
            }
        });

        return res.sendStatus(204);
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
}