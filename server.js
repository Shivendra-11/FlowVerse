import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/userAuth.js"
import Submissionrouter from "./routes/submissioin.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problemRouter.js";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problem", problemRouter);
app.use("/api/v1/submission", Submissionrouter);

const PORT = process.env.PORT;

// Start server function
function startServer() {
  return new Promise((resolve, reject) => {
    app.listen(PORT, (err) => {
      if (err) return reject(err);
      console.log(`Server running on port ${PORT}`);
      resolve();
    });
  });
}

// Initialize Redis + Server
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
