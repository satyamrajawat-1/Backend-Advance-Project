// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
// import mongoose from 'mongoose'
// import { DB_NAME } from './constants';
// import express from 'express'
import connectDB from './db/index.js';
dotenv.config({
    path:'./env'
})

import { app } from "./app.js";




connectDB()
.then(
    app.on('error',(error)=>{
        console.log("ERROR",error)
        throw new Error
    }),
    
    app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
)
.catch((err)=>{
    console.log(`DATABASE CONNECTION ERROR ${err}`)
})

/*
const app = express()
;(async()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR",error)
        throw error
    }
})()
    */