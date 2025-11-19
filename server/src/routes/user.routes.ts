import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { deleteUser, getAllUser, getUserById, updateUser, searchUsers } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get('/', requireAuth, getAllUser);
userRouter.get('/search', requireAuth, searchUsers);
userRouter.get('/:id', requireAuth, getUserById);
userRouter.put('/:id', requireAuth, updateUser);
userRouter.delete('/:id', requireAuth, deleteUser);

export default userRouter;