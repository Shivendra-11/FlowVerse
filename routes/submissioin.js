import express from 'express';  
import userAuthmiddleware from '../middleware/UserAuthmiddleware.js';
import { getallproblemsolved, runcode, submitCode } from '../Controllers/submissioncode.js';
import user from '../models/user.js';
const Submissionrouter = express.Router();

Submissionrouter.post('/submit/:id', userAuthmiddleware, submitCode);
Submissionrouter.get('/getallproblemsolved',userAuthmiddleware, getallproblemsolved);
Submissionrouter.post('/runcode/:id', userAuthmiddleware, runcode);
export default Submissionrouter;

