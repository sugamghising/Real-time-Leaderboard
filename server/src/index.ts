import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import gameRouter from './routes/game.routes';



const app = express();
dotenv.config();


const PORT = process.env.PORT || 5000

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

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})
