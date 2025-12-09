import express from "express";
import  AdminMiddleware  from "../middleware/AdminMiddleware.js";
import {createProblem, deleteProblem, getAllProblems, getProblemById, ProblemUpdate,} from "../Controllers/problems.js";
import userAuthmiddleware from "../middleware/UserAuthmiddleware.js";
const problemRouter=express.Router();

// need admin permission:-
problemRouter.post('/createProblem',AdminMiddleware,createProblem);
problemRouter.put('/modify/:id',userAuthmiddleware ,ProblemUpdate);
problemRouter.delete('/remove/:id',AdminMiddleware,deleteProblem);

// no need of admin permission:-
problemRouter.get('/view/:id',userAuthmiddleware, getProblemById);
problemRouter.get('/viewallproblems',userAuthmiddleware, getAllProblems);

export default problemRouter;