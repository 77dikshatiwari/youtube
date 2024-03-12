// import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import {app} from './app.js';
import connectDB from './database/db.js';


// const app = express();

connectDB()
.then(()=>{
    console.log("MongoDB connected successfully !!!")
})
.catch((error)=>{
    console.log("MongoDB connection failed !!!: ", error)
});

app.get('/', (req, res)=>{
    res.send("Hello World")
});

const port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
