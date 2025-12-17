import express from "express";
import adminMiddleware from "../middleware/AdminMiddleware.js";  
const videoRouter = express.Router();
import {generateUploadSignature, saveVideoMetadata, deleteVideo} from "../Controllers/videoSection.js";  

videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:videoId",adminMiddleware,deleteVideo);

export default videoRouter;