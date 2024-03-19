import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//Routes import
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthcheckRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import tweetRoutes from "./routes/tweetRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
// import dotenv from "dotenv";
// dotenv.config({path: "./config.env"}); //configuring environment variables only use .env file not config.env 

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
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/videos", videoRoutes);



export {app};