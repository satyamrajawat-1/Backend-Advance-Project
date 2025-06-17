import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try {
       const connectioInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`Mongo Db connected !! DB HOST : ${connectioInstance.connection.host}`)
    } catch (error) {
        console.log("MONGO DB CONNECTION ERROR", error);
        process.exit(1)
    }
}

export default connectDB