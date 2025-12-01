const express=require("express");
const app=express();
const env=require("dotenv").config();
const path=require("path")
const db=require("./config/db");
const userRouter=require("./routes/userRouter");
db();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));




app.set("view engine","ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/partials")
]);


app.use("/",userRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`Server Running on${PORT}  http://localhost:${PORT}`)})


module.exports=app;