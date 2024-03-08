import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
// import dotenv from "dotenv";
// dotenv.config({path: "../config.env"});

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOSt : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDb connection error: ", error);
        throw error;        
    }
}

export default connectDB;