import express from "express";
import userAuthmiddleware from "../middleware/UserAuthmiddleware.js";
import { FlowAi } from "../Controllers/FlowAi.js";
const FlowAirouter = express.Router();

FlowAirouter.post("/generate", userAuthmiddleware, FlowAi);

export default FlowAirouter;