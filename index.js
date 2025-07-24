const express = require("express");
const connectDB = require("./config/connectDB");
const dotenv = require("dotenv");

dotenv.config();

connectDB();

const app = express();

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running in ${process.env.PORT}`);
})