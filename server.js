import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/userAuth.js";
import Submissionrouter from "./routes/submissioin.js";
import redisClient from "./config/redis.js";
import FlowAirouter from "./routes/FlowAi.js";
import problemRouter from "./routes/problemRouter.js";
import videoRouter from "./routes/videoCreator.js"; 

dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// JSON & Cookies
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problem", problemRouter);
app.use("/api/v1/submission", Submissionrouter);
app.use("/api/v1/flowai", FlowAirouter);
app.use("/api/v1/video", videoRouter);

const PORT = process.env.PORT;

function startServer() {
  return new Promise((resolve, reject) => {
    app.listen(PORT, (err) => {
      if (err) return reject(err);
      console.log(`Server running on port ${PORT}`);
      resolve();
    });
  });
}

async function InitializeConnection() {
  try {
    await Promise.all([
      redisClient.connect(),
      startServer()
    ]);

    console.log("Redis + Server initialized successfully");
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

InitializeConnection();
