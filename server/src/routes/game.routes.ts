import express from "express";
import { createGame, deleteGame, getAllGame, getGameById, updateGame } from "../controllers/game.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { upload } from "../utils/multer";

const gameRouter = express.Router();

gameRouter.get('/', getAllGame);
gameRouter.get('/:id', getGameById);
gameRouter.post('/', requireAuth, requireRole('ADMIN'), upload.single("image"), createGame);
gameRouter.put('/:id', requireAuth, requireRole('ADMIN'), upload.single("image"), updateGame);
gameRouter.delete('/:id', requireAuth, requireRole('ADMIN'), deleteGame);

export default gameRouter;