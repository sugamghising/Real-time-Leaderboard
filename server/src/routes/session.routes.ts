import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { createSession, getSessions, getSessionStats } from "../controllers/session.controller";

const router = Router();

router.post("/", requireAuth, createSession);
router.get("/", requireAuth, getSessions);
router.get("/stats/:gameId", requireAuth, getSessionStats);

export default router;
