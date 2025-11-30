const express=require("express");
const app=express();
const env=require("dotenv").config();

const PORT = process.env.PORT || 5000;
const db=require("./config/db");
db();


app.listen(process.env.PORT,()=>{console.log(`Server Running on${PORT}  http://localhost:${PORT}`)})


module.exports=app;