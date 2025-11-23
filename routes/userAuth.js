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

export default authRouter;
