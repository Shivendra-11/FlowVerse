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
authRouter.get("/check", userAuthmiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const reply = {
        message: "User is authenticated",       
        user: {
            id: user._id,
            name: user.firstName + " " + user.lastName,
            role: user.role,
        }
    }

    return res.status(200).json({
        message:" User is authenticated",
        data:reply
    });

    
    }  catch(error){
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


export default authRouter;
