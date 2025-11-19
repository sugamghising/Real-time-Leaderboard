import { Request, Response } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import prisma from '../config/db';

export const getGameLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id: gameId } = req.params;
        const limit = parseInt(req.query.limit as string) || 100;

        if (!gameId) {
            return res.status(400).json({ error: 'Game ID is required' });
        }

        const leaderboard = await leaderboardService.getGameLeaderboard(gameId, limit);

        // Populate user details
        const userIds = leaderboard.map(entry => entry.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, displayName: true, avatarUrl: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));
        const enrichedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            user: userMap.get(entry.userId)
        }));
        // Debug: log enriched leaderboard user mapping for inspection
        console.log('Enriched global leaderboard (user ids -> usernames):', enrichedLeaderboard.map(e => ({ userId: e.userId, username: e.user?.username })));
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.status(200).json(enrichedLeaderboard);
    } catch (error) {
        console.error('Error getting game leaderboard', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;

        const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);

        // Populate user details
        const userIds = leaderboard.map(entry => entry.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, displayName: true, avatarUrl: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));
        const enrichedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            user: userMap.get(entry.userId)
        }));
        // Debug: log enriched leaderboard user mapping for inspection
        console.log('Enriched game leaderboard (user ids -> usernames):', enrichedLeaderboard.map(e => ({ userId: e.userId, username: e.user?.username })));

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.status(200).json(enrichedLeaderboard);
    } catch (error) {
        console.error('Error getting global leaderboard', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getDailyLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id: gameId } = req.params;
        const limit = parseInt(req.query.limit as string) || 100;
        const dateParam = req.query.date as string;

        if (!gameId) {
            return res.status(400).json({ error: 'Game ID is required' });
        }

        const date = dateParam ? new Date(dateParam) : new Date();
        const leaderboard = await leaderboardService.getDailyLeaderboard(gameId, date, limit);

        // Populate user details
        const userIds = leaderboard.map(entry => entry.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, displayName: true, avatarUrl: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));
        const enrichedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            user: userMap.get(entry.userId)
        }));

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.status(200).json(enrichedLeaderboard);
    } catch (error) {
        console.error('Error getting daily leaderboard', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getUserRank = async (req: Request, res: Response) => {
    try {
        const { id: gameId } = req.params;
        const userId = req.user?.userId;

        if (!gameId) {
            return res.status(400).json({ error: 'Game ID is required' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await leaderboardService.getUserRankInGame(gameId, userId);

        if (!result) {
            return res.status(404).json({ error: 'No rank found for this user' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user rank', error);
        res.status(500).json({ error: (error as Error).message });
    }
};
