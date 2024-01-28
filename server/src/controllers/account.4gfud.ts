import { Request, Response } from "express";

import { RequestUser } from "../middlerwares";
import { prisma } from "../utils";

interface DataResponse {
    id: string;
    username: string;
    avatarUrl?: string;
    backgroundUrl?: string;
    followerId?: string[];
    followingId?: string[];
}

export async function getMany(_req: Request, res: Response) {
    try {
        await prisma.$connect();

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                avatar: {
                    select: {
                        url: true
                    }
                },
                follower: {
                    select: {
                        FollowerFollowing: {
                            select: {
                                followingId: {
                                    select: {
                                        userId: true
                                    }
                                }
                            }
                        }
                    }
                },
                following: {
                    select: {
                        FollowerFollowing: {
                            select: {
                                followerId: {
                                    select: {
                                        userId: true
                                    }
                                }
                            }
                        }
                    }
                },
                background: {
                    select: {
                        url: true
                    }
                }
            }
        });

        const dataResponse: DataResponse[] = users.map(value => {
            const followerId = value.follower.map(follower => follower.FollowerFollowing.followingId?.userId as string);
            const followingId = value.following.map(following => following.FollowerFollowing.followerId?.userId as string);
            return {
                id: value.id,
                username: value.username,
                avatarUrl: value.avatar?.url,
                backgroundUrl: value.background?.url,
                followerId,
                followingId
            }
        });

        return res.status(200).json({ message: "Find successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function getOne(req: Request, res: Response) {
    const userId = req.params.userId;
    try {
        await prisma.$connect();

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                avatar: {
                    select: {
                        url: true
                    }
                },
                follower: {
                    select: {
                        FollowerFollowing: {
                            select: {
                                followingId: {
                                    select: {
                                        userId: true
                                    }
                                }
                            }
                        }
                    }
                },
                following: {
                    select: {
                        FollowerFollowing: {
                            select: {
                                followerId: {
                                    select: {
                                        userId: true
                                    }
                                }
                            }
                        }
                    }
                },
                background: {
                    select: {
                        url: true
                    }
                }
            }
        });

        const dataResponse: DataResponse = {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar?.url,
            backgroundUrl: user.background?.url,
            followerId: user.follower.map(follower => follower.FollowerFollowing.followingId?.userId as string),
            followingId: user.following.map(following => following.FollowerFollowing.followerId?.userId as string)
        };

        return res.status(200).json({ message: "Find successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function getFollower(req: RequestUser, res: Response) {
    const userId = !req.params.userId ? req.userId : req.params.userId;

    try {
        await prisma.$connect();

        const follower = await prisma.follower.findMany({
            where: { userId },
            include: {
                FollowerFollowing: {
                    include: { followingId: true }
                }
            }
        });

        const followerId = follower.map(value => value.FollowerFollowing.followingId?.userId as string);

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: followerId
                }
            },
            select: {
                id: true,
                username: true,
                avatar: {
                    select: {
                        url: true
                    }
                }
            }
        });

        const dataResponse: DataResponse[] = users.map(value => {
            return {
                id: value.id,
                username: value.username,
                avatarUrl: value.avatar?.url
            }
        });

        return res.json({ message: "Find follower successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function getFollowing(req: RequestUser, res: Response) {
    const userId = !req.params.userId ? req.userId : req.params.userId;

    try {
        await prisma.$connect();

        const following = await prisma.following.findMany({
            where: { userId },
            include: {
                FollowerFollowing: {
                    include: { followerId: true }
                }
            }
        });

        const followingId = following.map(value => value.FollowerFollowing.followerId?.userId as string);

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: followingId
                }
            },
            select: {
                id: true,
                username: true,
                avatar: {
                    select: {
                        url: true
                    }
                }
            }
        });

        const dataResponse: DataResponse[] = users.map(value => ({
            username: value.username,
            id: value.id,
            avatarUrl: value.avatar?.url
        }));

        return res.json({ message: "Find following successfully.", data: dataResponse });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function follow(req: RequestUser, res: Response) {
    const id = req.userId; // follower
    const { userId } = req.params; // following

    if (!userId) {
        return res.status(400).json({ message: "Validation failed." });
    }

    if (id === userId) {
        return res.status(400).json({ message: "Can't follow your account." });
    }

    try {
        await prisma.$connect();

        const fromUser = await prisma.user.findUniqueOrThrow({
            where: { id },
            include: {
                following: {
                    include: {
                        FollowerFollowing: {
                            select: {
                                followerId: true,
                                id: true
                            }
                        }
                    }
                }
            }
        });
        const toUser = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "Not found users." });
        }

        for (const followingItem of fromUser.following) {
            if (followingItem.FollowerFollowing.followerId?.userId === toUser.id) {
                return res.status(200).json({ message: "You are followed." });
            }
        }

        await prisma.followerFollowing.create({
            data: {
                followerId: {
                    create: {
                        userId: toUser.id
                    }
                },
                followingId: {
                    create: {
                        userId: fromUser.id
                    }
                }
            }
        });

        return res.status(200).json({ message: "Follow successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function unFollow(req: RequestUser, res: Response) {
    const id = req.userId; // follower
    const { userId } = req.params; // following

    if (!userId) {
        return res.status(400).json({ message: "Validation failed." });
    }

    if (id === userId) {
        return res.status(400).json({ message: "Can't follow your account." });
    }

    try {
        await prisma.$connect();
        const ffId: string[] = [];
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                following: {
                    include: {
                        FollowerFollowing: true
                    }
                }
            }
        });

        user.following.forEach(async value => {
            ffId.push(value.FollowerFollowing.id);

            await prisma.followerFollowing.update({
                where: {
                    id: value.FollowerFollowing.id
                },
                data: {
                    followerId: {
                        delete: true
                    },
                    followingId: {
                        delete: true
                    }
                }
            });
        });

        await prisma.followerFollowing.deleteMany({
            where: {
                id: {
                    in: ffId
                }
            }
        });

        return res.status(200).json({ message: "Unfollow successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}

export async function deleteFollower(req: RequestUser, res: Response) {
    const id = req.userId; // following
    const { userId } = req.params; // follower

    if (!userId) {
        return res.status(400).json({ message: "Validation failed." });
    }

    if (id === userId) {
        return res.status(400).json({ message: "Can't follow your account." });
    }

    try {
        await prisma.$connect();
        const ffId: string[] = [];
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                follower: {
                    include: {
                        FollowerFollowing: true
                    }
                }
            }
        });

        user.follower.forEach(async value => {
            ffId.push(value.FollowerFollowing.id);

            await prisma.followerFollowing.update({
                where: {
                    id: value.FollowerFollowing.id
                },
                data: {
                    followerId: {
                        delete: true
                    },
                    followingId: {
                        delete: true
                    }
                }
            });
        });

        await prisma.followerFollowing.deleteMany({
            where: {
                id: {
                    in: ffId
                }
            }
        });

        return res.status(200).json({ message: "Delete follower successfully." });
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}