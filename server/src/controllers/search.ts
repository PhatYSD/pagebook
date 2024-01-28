import { Request, Response } from "express";

import { prisma } from "../utils";

export async function searchBar(req: Request, res: Response) {
    const searchText: string = req.query.searchText as string | "";

    try {
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: searchText,
                    mode: "insensitive"
                }
            },
            select: {
                avatar: {
                    select: {
                        url: true
                    }
                },
                id: true,
                username: true
            }
        });
        const posts = await prisma.post.findMany({
            where: {
                title: {
                    contains: searchText,
                    mode: "insensitive"
                }
            },
            take: 3,
            select: {
                id: true,
                title: true,
                image: {
                    select: {
                        url: true
                    }
                }
            }
        });

        const dataResponse = {
            message: "Search successfully.",
            users: users.map(value => {
                return {
                    id: value.id,
                    username: value.username,
                    avatarUrl: value.avatar?.url
                }
            }),
            posts: posts.map(value => {
                return {
                    id: value.id,
                    title: value.title,
                    imageUrl: value.image[0].url
                }
            })
        }

        res.status(200).json(dataResponse);
    } catch (err) {
        const error = err instanceof Error ? err.message : err;
        return res.status(500).json({ message: "Internal server error.", error });
    } finally {
        await prisma.$disconnect();
    }
}