import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//Routes import
import userRoutes from "./routes/userRoutes.js";
// import dotenv from "dotenv";
// dotenv.config({path: "./config.env"}); //configuring environment variables

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static("public"));
app.use(cookieParser())

//Routes
app.use("/api/v1/users", userRoutes);

export {app};