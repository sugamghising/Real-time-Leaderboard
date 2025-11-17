import { Request, Response } from "express";
import * as friendService from "../services/friend.service";
import { sendFriendRequestSchema } from "../schemas/friend.schema";

export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const parsed = sendFriendRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const requesterId = req.user?.userId as string;
        const { receiverId } = parsed.data;

        const friendship = await friendService.sendRequest(requesterId, receiverId);

        // Emit event to receiver
        const io = req.app.get("io");
        io?.to(`user:${receiverId}`).emit("friend:request", { friendship });

        res.status(201).json({ message: 'Friend request sent', friendship });
    } catch (error) {
        console.error("Error in sending a friend request", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const respondFriendRequestAccept = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const friendAccept = await friendService.respondRequestAccept(userId, requestId);

        const io = req.app.get("io");
        io?.to(`user:${friendAccept.requesterId}`).emit("friend:accepted", { friendship: friendAccept });

        res.status(200).json({ message: 'Friend request accepted', friendship: friendAccept });

    } catch (error) {
        console.error("Error in accepting a friend request", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const respondFriendRequestReject = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const friendReject = await friendService.respondRequestReject(userId, requestId);

        const io = req.app.get("io");
        io?.to(`user:${friendReject.requesterId}`).emit("friend:rejected", { friendship: friendReject });

        res.status(200).json({ message: 'Friend request rejected', friendship: friendReject });
    } catch (error) {
        console.error("Error in rejecting a friend request", error);
        res.status(400).json({ error: (error as Error).message });
    }
}


export const listFriend = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const friends = await friendService.listFriends(userId);

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error in listing friends", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const removeFriend = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const { friendId } = req.params;

        if (!friendId) {
            return res.status(400).json({ error: 'Friend ID is required' });
        }

        await friendService.removeFriend(userId, friendId);

        res.status(200).json({ message: 'Friend removed successfully', success: true });
    } catch (error) {
        console.error("Error in removing a friend", error);
        res.status(400).json({ error: (error as Error).message });
    }
}

export const listFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId as string;
        const friendRequests = await friendService.listPendingrequest(userId);

        res.status(200).json(friendRequests);
    } catch (error) {
        console.error("Error in listing a friend request.", error);
        res.status(400).json({ error: (error as Error).message });
    }
}