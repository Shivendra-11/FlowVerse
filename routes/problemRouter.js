const express=require("express");
const Problem=require("../models/problem");

const problemRouter=express.Router();

// need admin permission:-
problemRouter.post('/createProblem',Problemcreate);
problemRouter.patch('/modify/:id',ProblemUpdate);
problemRouter.delete('/remove/:id',deleteProblem);
// no need of admin permission:-
problemRouter.get('/view/:id',getProblemById);
problemRouter.get('/solvedproblem',getAllProblems);
module.exports=problemRouter;