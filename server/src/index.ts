import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'

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


app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})
