// Entry point: sets up Express, security middleware, routes and the MongoDB connection.
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./auth.js";
import apiRoutes from "./routes.js";

const app = express();
app.set("trust proxy", 1); // needed behind Render/Railway proxies
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // only our frontend may call us
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.get("/", (req, res) => res.send("HabitFlow API running"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log("Server started")))
  .catch((e) => console.error("MongoDB connection failed:", e.message));
