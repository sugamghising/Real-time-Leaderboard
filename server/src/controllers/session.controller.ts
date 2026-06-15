import { Request, Response } from "express";
import { sessionService } from "../services/session.service";
import { createSessionSchema, getSessionsQuerySchema } from "../schemas/session.schema";

export const createSession = async (req: Request, res: Response) => {
  try {
    const parsed = createSessionSchema.parse(req.body);
    const session = await sessionService.create({
      userId: req.user!.userId,
      gameId: parsed.gameId,
      score: parsed.score,
      ...(parsed.duration != null ? { duration: parsed.duration } : {}),
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.meta ? { meta: parsed.meta } : {}),
    });
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Validation error", details: err.errors });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const query = getSessionsQuerySchema.parse(req.query);
    const result = await sessionService.listByGame(query.gameId || "", {
      limit: query.limit,
      ...(query.cursor ? { cursor: query.cursor } : {}),
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Validation error", details: err.errors });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

export const getSessionStats = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      res.status(400).json({ error: "gameId is required" });
      return;
    }
    const stats = await sessionService.getStats(gameId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
