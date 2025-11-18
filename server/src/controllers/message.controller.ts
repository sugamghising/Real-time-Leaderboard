import { Request, Response } from "express";
import { createMessageSchema, markReadSchema } from "../schemas/message.schema";
import * as messageService from "../services/message.service"

export const sendMessage = async (req: Request, res: Response) => {

    try {
        const parsed = createMessageSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }
        const { toUserId, content } = parsed.data;
        const fromUserId = req.user?.userId as string;

        if (fromUserId === toUserId) {
            return res.status(400).json({ error: 'Cannot send message to yourself' });
        }

        const created = await messageService.createMessage(fromUserId, toUserId, content);

        const io = req.app.get("io");
        const messagePayload = {
            id: created.id,
            fromUserId: created.fromUserId,
            toUserId: created.toUserId,
            content: created.content,
            isRead: created.isRead,
            createdAt: created.createdAt,
        };
        //emit to receiver
        if (io) {
            io.to(`user:${toUserId}`).emit("message:new", messagePayload);
            //emit to sender
            io.to(`user:${fromUserId}`).emit("message:sent", messagePayload);

            //increament the unread count
            const unreadCount = await messageService.getUnreadCount(toUserId);
            io.to(`user:${toUserId}`).emit("message:unread_count", { count: unreadCount });
        }

        res.status(201).json({ success: true, message: messagePayload });
    } catch (error) {
        console.error("Error in creating/sending a message", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const getConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const otherUserId = req.params.userId as string;
        const limit = Number(req.query.limit) || 50;
        const cursor = req.query.cursor as string | undefined;

        if (!otherUserId) {
            return res.status(400).json({ error: 'Other user ID is required' });
        }

        const messages = await messageService.getConversation(userId, otherUserId, limit, cursor);
        res.json({ messages });
    } catch (error) {
        console.error("Error in getting a message", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const markMessagesAsRead = async (req: Request, res: Response) => {
    try {
        const body = markReadSchema.parse(req.body);
        const userId = req.user?.userId as string;
        const { messageIds } = body;

        const { updated } = await messageService.markMessagesAsRead(userId, messageIds);

        // emit updated unread count to user
        const unreadCount = await messageService.getUnreadCount(userId);
        const io = req.app.get("io");
        if (io) {
            io.to(`user:${userId}`).emit("message:unread_count", { count: unreadCount });
        }
        res.json({ success: true, updated, unreadCount });
    } catch (error) {
        console.error("Error in marking messages as Read", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const count = await messageService.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error("Error in getting unread count", error);
        res.status(400).json({ error: (error as Error).message });
    }
}