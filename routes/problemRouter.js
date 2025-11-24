import express from "express";
import Problem from "../models/problem.js";
// import  AdminMiddleware  from "../middleware/AdminMiddleware";
import {createproblem} from "../Controllers/problems.js";

const problemRouter=express.Router();

// need admin permission:-
problemRouter.post('/createProblem',createproblem);
// problemRouter.patch('/modify/:id',AdminMiddleware,ProblemUpdate);
// problemRouter.delete('/remove/:id',AdminMiddleware,deleteProblem);
// no need of admin permission:-
// problemRouter.get('/view/:id',getProblemById);
// problemRouter.get('/solvedproblem',getAllProblems);

export default problemRouter;