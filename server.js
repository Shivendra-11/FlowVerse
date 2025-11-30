import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/userAuth.js"
import redisClient from "./config/redis.js";

dotenv.config();

import problemRouter from "./routes/problemRouter.js";

connectDB();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problem", problemRouter);

const PORT = process.env.PORT || 5000;
  

// Wrap server start into a promise
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
