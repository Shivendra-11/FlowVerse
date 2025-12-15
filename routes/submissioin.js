import express from 'express';  
import userAuthmiddleware from '../middleware/UserAuthmiddleware.js';
import { DeleteuserProfile, getallproblemsolved, runcode, submitCode, submittedproblem } from '../Controllers/submissioncode.js';
import user from '../models/user.js';
const Submissionrouter = express.Router();

Submissionrouter.post('/submit/:id', userAuthmiddleware, submitCode);
Submissionrouter.get('/getallproblemsolved',userAuthmiddleware, getallproblemsolved);
Submissionrouter.post('/runcode/:id', userAuthmiddleware, runcode);
Submissionrouter.delete('/deleteuserprofile/', userAuthmiddleware, DeleteuserProfile);
Submissionrouter.get("/submittedproblem/:pid",userAuthmiddleware,submittedproblem);
export default Submissionrouter;
