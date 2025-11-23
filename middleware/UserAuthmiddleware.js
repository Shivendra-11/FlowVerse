import jwt from "jsonwebtoken";
import user from "../models/user.js";
import redisClient from "../config/redis.js";

const userAuthmiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Not a logged-in user",
      });
    }

    const isBlocked = await redisClient.get(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    const payload = jwt.verify(token, process.env.JWT);
    const { id } = payload;
  
    if (!id) {
      return res.status(401).json({
        message: "Invalid token: no user ID found",
      });
    }
    const loggedInUser = await user.findById(id);

    if (!loggedInUser) {
      return res.status(404).json({
        message: "User not found",
      });
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

export default userAuthmiddleware;