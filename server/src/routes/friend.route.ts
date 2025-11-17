import express from "express"
import { requireAuth } from "../middleware/auth.middleware";
import { listFriend, listFriendRequest, removeFriend, respondFriendRequestAccept, respondFriendRequestReject, sendFriendRequest } from "../controllers/friend.controller";

const friendRouter = express.Router();

friendRouter.post('/request', requireAuth, sendFriendRequest);
friendRouter.post('/accept/:requestId', requireAuth, respondFriendRequestAccept);
friendRouter.post('/reject/:requestId', requireAuth, respondFriendRequestReject);
friendRouter.get('/', requireAuth, listFriend);
friendRouter.get('/requests', requireAuth, listFriendRequest);
friendRouter.delete('/:friendId', requireAuth, removeFriend);

export default friendRouter;