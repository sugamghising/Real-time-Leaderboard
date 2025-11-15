import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { deleteUser, getAllUser, getUserById, updateUser } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get('/', requireAuth, getAllUser);
userRouter.get('/:id', requireAuth, getUserById);
userRouter.put('/:id', requireAuth, updateUser);
userRouter.delete('/:id', requireAuth, deleteUser);

export default userRouter;