import { Request, Response } from "express";
import { createScoreSchema } from "../schemas/score.schema";
import * as scoreService from '../services/score.service';
import { leaderboardService } from "../services/leaderboard.service";

export const createScore = async (req: Request, res: Response) => {
    try {
        const parsed = createScoreSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const { score, meta } = parsed.data;
        const gameId = req.params.id;
        const userId = req.user?.userId;

        if (!gameId) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const saved = await scoreService.createScore({ userId, gameId, score, meta });

        const { updated, rank, score: storedScore } = await leaderboardService.updateScoresIfBetter(gameId, userId, score);
        const io = req.app.get("io");
        if (io && updated) {
            // Emit to game room for game-specific updates
            io.to(`game:${gameId}`).emit("leaderboard:update", {
                gameId,
                userId,
                score: storedScore,
                rank
            });
            // Emit globally for global leaderboard updates
            io.emit("leaderboard:update", {
                gameId,
                userId,
                score: storedScore,
                rank
            });
        }
        res.status(201).json({
            success: true,
            saved,
            leaderboardUpdated: updated,
            rank,
            score: storedScore
        });
    } catch (error) {
        console.error("Error in creating a score", error);
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getBestScoreForUser = async (req: Request, res: Response) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.userId;

        if (!gameId) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const bestScore = await scoreService.getBestScoreForUser(userId, gameId);

        if (!bestScore) {
            return res.status(404).json({ error: "No scores found" });
        }

        res.status(200).json(bestScore);
    } catch (error) {
        console.error("Error in getting best score", error);
        res.status(500).json({ error: (error as Error).message });
    }
};