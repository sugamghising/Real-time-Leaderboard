import { Request, Response } from "express";
import * as gameService from "../services/game.service";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { createGameSchema, updateGameSchema } from "../schemas/game.schema";

export const createGame = async (req: Request, res: Response) => {
    try {
        const parsed = createGameSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const data = parsed.data;
        let imageUrl: string | undefined = undefined;

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        if (!req.user?.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const game = await gameService.createGame(
            {
                ...data,
                ...(imageUrl ? { imageUrl } : {}),
            },
            req.user.userId
        );

        res.status(201).json({
            message: "Game created successfully",
            game
        });
    } catch (error) {
        console.error("Error in creating game", error);
        res.status(400).json({ error: (error as Error).message });
    }
};



export const getAllGame = async (req: Request, res: Response) => {
    try {
        const games = await gameService.findAllGame();
        res.status(200).json(games);
    } catch (error) {
        console.error("Error in getting all games", error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getGameById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        const game = await gameService.findGameById(id);
        res.status(200).json(game);
    } catch (error) {
        console.error("Error in getting game by id", error);
        res.status(404).json({ error: (error as Error).message });
    }
};

export const updateGame = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        const parsed = updateGameSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const data = parsed.data;
        let imageUrl: string | undefined = undefined;

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        const updatedGame = await gameService.updateGame(id, {
            ...data,
            ...(imageUrl ? { imageUrl } : {}),
        });

        res.status(200).json({
            message: "Game updated successfully",
            game: updatedGame
        });
    } catch (error) {
        console.error("Error in updating game", error);
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteGame = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        await gameService.deleteGame(id);
        res.status(200).json({
            message: "Game deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Error in deleting game", error);
        res.status(400).json({ error: (error as Error).message });
    }
};