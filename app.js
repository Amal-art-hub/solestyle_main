const express = require("express");
const app = express();
const env = require("dotenv").config();
const session = require("express-session")
const MongoStore = require('connect-mongo').default;
const passport = require("passport");     // ✔️ import passport library
require("./config/passport");

const path = require("path")
const db = require("./config/db");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 72 * 60 * 60
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000
  }
}))
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.set("cache-control", "no-store")
  next();
})




app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/partials")
]);


app.use("/", userRouter);
app.use("/admin", adminRouter)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server Running on${PORT}  http://localhost:${PORT}`) })


module.exports = app;