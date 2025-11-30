const express=require('express');
import userAuthmiddleware from '../middleware/UserAuthmiddleware.js';
import {submissioncode} from '../Controllers/submissionController.js';
const Submissionrouter = express.Router();

Submissionrouter.post('/submit/:id', userAuthmiddleware, submissioncode);
export default Submissionrouter;

