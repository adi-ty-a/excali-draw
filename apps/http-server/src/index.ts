import express from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SiginSchema } from "@repo/common-package/types";
import { prismaClient } from "@repo/db/clients";
import * as bcrypt from "bcrypt";
import cors from "cors";
require('dotenv').config();

const app = express();
const saltRounds = 3;

app.use(express.json());
app.use(cors());

app.post("/signUp", async (req, res) => {
    const zodvalidation = CreateUserSchema.safeParse(req.body);
    if (!zodvalidation.success) {
        const error = zodvalidation.error;
        return res.status(400).json({
            msg: "invalid inputs",
            error: error.issues[0]?.message || "Validation failed",
            issues: error.issues
        });
    }

    const { username, password, email } = req.body;
    try {
        const hash = bcrypt.hashSync(password, saltRounds);
        await prismaClient.users.create({
            data: {
                name: username,
                password: hash,
                email: email
            }
        });
        return res.status(200).json({
            msg: "signedup"
        });
    } catch (e: any) {
        if (e.code === "P2002") {
            return res.status(409).json({
                msg: "user already exist",
                error: "user already exist",
                field: e.meta?.target
            });
        }
        return res.status(500).json({
            msg: "server error",
            error: "Something went wrong, please try again later"
        });
    }
});

app.post("/signIn", async (req, res) => {
    const zodvalidation = SiginSchema.safeParse(req.body);
    if (!zodvalidation.success) {
        return res.status(400).json({
            msg: "invalid inputs",
            issues: zodvalidation.error.issues
        });
    }

    const { email, password } = req.body;
    try {
        const response = await prismaClient.users.findFirst({
            where: {
                email: email
            },
            select: {
                password: true,
                id: true
            }
        });

        if (!response) {
            return res.status(403).json({
                msg: "username or db error"
            });
        }

        const isuser = await bcrypt.compare(password, response.password);
        if (!isuser) {
            return res.status(403).json({
                msg: "wrong pass"
            });
        }

        const id = response.id;
        const secret = process.env.JWT_SECRET as string;
        const token = jwt.sign({ id }, secret);
        return res.status(200).json({
            msg: "logged in",
            token
        });
    } catch (e) {
        console.error("signIn error:", e);
        return res.status(500).json({
            msg: "server error"
        });
    }
});

app.post("/create-room", Middleware, async (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({
            msg: "wrong inputs",
            issues: data.error.issues
        });
    }

    const userid = req.userid;
    if (!userid) {
        return res.status(403).json({
            msg: "the userid is undefined"
        });
    }

    try {
        const isNameExist = await prismaClient.rooms.findUnique({
            where: {
                slug: data.data.name
            }
        });

        if (isNameExist != null) {
            return res.status(200).json({
                msg: "Name exist",
                status: false
            });
        }

        const response = await prismaClient.rooms.create({
            data: {
                slug: data.data.name,
                adminId: userid
            }
        });

        return res.status(200).json({
            msg: "room created",
            status: true,
            roomId: response.id,
            id: response.id
        });
    } catch (e) {
        console.error("create-room error:", e);
        return res.status(500).json({
            msg: "server error"
        });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    const param = req.params.roomId;
    let roomid = Number(param);

    try {
        if (isNaN(roomid)) {
            const room = await prismaClient.rooms.findFirst({
                where: {
                    slug: param
                },
                select: {
                    id: true
                }
            });
            if (!room) {
                return res.status(404).json([]);
            }
            roomid = room.id;
        }

        const messages = await prismaClient.chat.findMany({
            where: {
                roomid: roomid
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        });

        return res.status(200).json(messages);
    } catch (e) {
        console.error("chats error:", e);
        return res.status(500).json([]);
    }
});

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    try {
        const response = await prismaClient.rooms.findFirst({
            where: {
                slug: slug
            },
            select: {
                id: true
            }
        });

        if (!response) {
            return res.status(404).json({
                msg: "no room of this name"
            });
        }

        return res.status(200).json({
            msg: "room found",
            id: response.id
        });
    } catch (e) {
        console.error("room slug error:", e);
        return res.status(500).json({
            msg: "server error"
        });
    }
});

app.get("/slug/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            msg: "invalid room id"
        });
    }

    try {
        const response = await prismaClient.rooms.findFirst({
            where: {
                id: id
            },
            select: {
                slug: true
            }
        });

        if (!response) {
            return res.status(404).json({
                msg: "no slug of this id"
            });
        }

        return res.status(200).json({
            msg: "slug found",
            slug: response.slug
        });
    } catch (err) {
        console.error("slug id error:", err);
        return res.status(500).json({
            msg: "server error"
        });
    }
});

app.get("/verify-token", Middleware, (req, res) => {
    return res.status(200).json({
        valid: true,
        userId: req.userid
    });
});

app.get("/userRooms/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            msg: "invalid user id",
            data: []
        });
    }

    try {
        const rooms = await prismaClient.rooms.findMany({
            where: {
                adminId: id
            },
            select: {
                slug: true
            },
            orderBy: { slug: 'asc' }
        });

        return res.status(200).json({
            data: rooms
        });
    } catch (e) {
        console.error("userRooms error:", e);
        return res.status(500).json({
            msg: "server error",
            data: []
        });
    }
});

app.get("/closeroom/:slug", Middleware, async (req, res) => {
    const userId = req.userid;
    const slug = req.params.slug;

    try {
        const whereClause: any = { slug };
        if (userId) {
            whereClause.adminId = userId;
        }

        await prismaClient.rooms.deleteMany({
            where: whereClause
        });

        return res.status(200).json({
            msg: "deleted the room",
            status: true
        });
    } catch (e) {
        console.error("closeroom error:", e);
        return res.status(500).json({
            msg: "some error to delete room",
            status: false
        });
    }
});

app.listen(3001);