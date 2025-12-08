import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import user from "../models/user.js";
import  validator  from "../utils/validator.js";
import redisClient from "../config/redis.js";
import dotenv from "dotenv";  

dotenv.config();
const JWT_SECRET = process.env.JWT ;
export const register = async (req, res) => {
  try {

    validator(req.body);

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.role = "user";
    const newUser = new user({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: "user", emailId: newUser.emailId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

   return res.status(201).json({ message: "User registered successfully", token , user: newUser });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const existingUser = await user.findOne({ emailId });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
        emailId: existingUser.emailId,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    const payload = jwt.decode(token);

    // Block token in Redis
    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    // Clear cookie
    res.cookie("token", "", {
      expires: new Date(Date.now())
    });

    return res.status(200).json({ message: "Logout successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const adminRegister=async(req,res)=>{
  try {

    if(req.user.role!=="admin"){
      return res.status(403).json({message:"Access denied. Admins only."});
    }

    validator(req.body);

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.role = "admin";
    const newUser = new user({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      role: "admin"
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: "admin", emailId: newUser.emailId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", token , user: newUser });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
