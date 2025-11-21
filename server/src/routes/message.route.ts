import express from "express"
import { getConversation, getUnreadCount, markMessagesAsRead, sendMessage, getMessagePreviews } from "../controllers/message.controller";
import { requireAuth } from "../middleware/auth.middleware";

const messageRouter = express.Router();

messageRouter.post('/', requireAuth, sendMessage);
messageRouter.get('/conversation/:userId', requireAuth, getConversation);
messageRouter.post('/mark-read', requireAuth, markMessagesAsRead);
messageRouter.get('/unread-count', requireAuth, getUnreadCount);
messageRouter.get('/previews', requireAuth, getMessagePreviews);

export default messageRouter;