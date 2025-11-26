import express from "express";
import User from "../models/user.js";
import { register, login, logout, adminRegister} from "../Controllers/userAuth.js";
import userAuthmiddleware from "../middleware/UserAuthmiddleware.js";

const authRouter = express.Router();

authRouter.use(express.json());

// Routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", userAuthmiddleware, logout);
authRouter.post("/admin/register", userAuthmiddleware, adminRegister);

// Catch errors from route handlers and provide better error messages
authRouter.use((err, req, res, next) => {
  console.error('Route error:', err);
  if (err.message && err.message.includes('reading')) {
    // Likely a null reference error
    return res.status(500).json({ 
      message: "Internal server error: null reference",
      error: err.message 
    });
  }
  res.status(500).json({ message: err.message });
});

export default authRouter;
