import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const AdminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // Check if token is blacklisted
    const isBlocked = await redisClient.get(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    // Decode token
    const payload = jwt.verify(token, process.env.JWT);
    const { id } = payload;

    if (!id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user from DB
    const loggedInUser = await User.findById(id);
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add null-safety check before accessing role
    if (!loggedInUser.role || loggedInUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = loggedInUser;
    req.token = token;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};

export default AdminMiddleware;
