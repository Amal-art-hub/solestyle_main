import express from "express";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

// Import your custom files (MUST end with .js)
import "./config/passport.js";
import db from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import compression from "compression";

const app = express();
app.use(compression());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


db();

app.set("trust proxy", 1);
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 72 * 60 * 60
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();
});

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/partials")
]);

// Routes
app.use("/", userRouter);
app.use("/admin", adminRouter);

// Error Handling
app.use("/test-error", (req, res, next) => {
  const err = new Error("This is a deliberate test error");
  err.statusCode = 418;
  next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT} http://localhost:${PORT}`);
});

export default app;