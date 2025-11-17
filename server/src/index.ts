import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import gameRouter from './routes/game.routes';
import scoreRouter from './routes/score.routes';
import leaderboardRouter from './routes/leaderboard.routes';
import http from "http";
import { initSocket } from './config/socket';
import messageRouter from './routes/message.route';
import friendRouter from './routes/friend.route';


const app = express();
const server = http.createServer(app);
dotenv.config();


const PORT = process.env.PORT || 5000

const io = initSocket(server);

app.set("io", io);
//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'))


app.get('/', (_req, res) => {
    res.send('Hello from Backend.');
})

//  routes
app.use('/v1/api/auth', authRouter);
app.use('/v1/api/users', userRouter);
app.use('/v1/api/games', gameRouter);
app.use('/v1/api/scores', scoreRouter);
app.use('/v1/api/leaderboard', leaderboardRouter);
app.use('/v1/api/messages', messageRouter);
app.use('/v1/api/friends', friendRouter);

server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
