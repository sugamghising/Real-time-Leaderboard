import { Request, Response } from "express";
import * as userService from '../services/user.service';
import { updateUserSchema } from '../schemas/user.schema';


export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await userService.getUserById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({
            message: "User not found",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
};

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUser();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Could not fetch users",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Only allow users to update their own profile unless they're admin
        if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: You can only update your own profile" });
        }

        const parsed = updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const updatedUser = await userService.updateUser(id, parsed.data);
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            message: "Could not update user",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Only allow users to delete their own profile unless they're admin
        if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: You can only delete your own profile" });
        }

        await userService.deleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({
            message: "Could not delete user",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
};