import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { deleteUser, getAllUser, getUserById, updateUser, searchUsers, uploadProfilePicture } from '../controllers/user.controller';
import { upload } from '../utils/multer';

const userRouter = express.Router();

userRouter.get('/', requireAuth, getAllUser);
userRouter.get('/search', requireAuth, searchUsers);
userRouter.get('/:id', requireAuth, getUserById);
userRouter.put('/:id', requireAuth, updateUser);
userRouter.delete('/:id', requireAuth, deleteUser);
userRouter.post('/profile-picture', requireAuth, upload.single('profilePicture'), uploadProfilePicture);

export default userRouter;