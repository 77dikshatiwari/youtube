import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path: './config.env'})
import connectDB from './database/db.js';

const app = express();

connectDB();

app.get('/', (req, res)=>{
    res.send("Hello World")
});

const port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
