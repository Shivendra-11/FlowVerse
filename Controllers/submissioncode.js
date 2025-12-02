import Problem from "../models/problem.js";
import user from "../models/user.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/LanguagaeId.js";
import submissioncode from "../models/submission.js";

export const submitCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    console.log("🔥 CODE SUBMISSION:", { userId, problemId });

    const { code, language } = req.body;
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send({
        message: "Please provide all the field",
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).send({
        message: "Problem not found for this id",
      });
    }

    const submission = await submissioncode.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
    });

    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).json({
        error: `Unsupported language '${language}'`,
      });
    }

    const submissions = problem.hiddenTestCases.map((testcase, index) => {
      return {
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      };
    });

    const submitResult = await submitBatch(submissions);
    if (!submitResult) {
      return res.status(500).json({ error: "Judge0 did not return tokens" });
    }

    const resultToken = submitResult.map((value) => value.token);

    const testResults = await submitToken(resultToken);

    let testcasepassed = 0;
    let status = "pending";
    let runtime = 0;
    let memory = 0;
    let errormessage = null;

    for (const test of testResults) {
      if (test.status.id === 3) {
        testcasepassed += 1;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
        errormessage = null;
      } else {
        if (test.status.id === 4) {
          status = "failed";
          errormessage = test.stderr;
        } else if (test.status.id === 5) {
          status = "rejected";
          errormessage = test.compile_output;
        } else if (test.status.id === 6) {
          status = "rejected";
          errormessage = test.message;
        } else {
          status = "rejected";
          errormessage = test.status.description;
        }
      }
    }
    // console.log("testcasepassed",testcasepassed);
    if (testcasepassed === testResults.length && testResults.length > 0) {
      status = "accepted";
    } else {
      status = "rejected";
    }

    submission.status = status;
    submission.runtime = runtime;
    submission.memory = memory;
    submission.errorMessage = errormessage;
    submission.testCasesPassed = testcasepassed;
    submission.totalTestCases = problem.hiddenTestCases.length;

    await submission.save();

    if (
      testcasepassed === problem.hiddenTestCases.length &&
      !req.user.problemSolved.includes(problemId)
    ) {
      req.user.problemSolved.push(problemId);
      await req.user.save();
    }

    return res.status(200).send({
      message: "Code submitted successfully",
      submission,
    });

    console.log("🔥 TEST RESULTS RECEIVED FROM JUDGE0:", testResults);
  } catch (err) {
    return res.status(400).send({
      message: "unable to submit the code due to server error",
      error: err.message,
    });
  }
};

export const getallproblemsolved = async (req, res) => {
  try {
    const userid = req.user._id;
    const userproblem = await user.findById(userid).populate({
      path: "problemSolved",
      select: " _id title difficulty",
    });
    return res
      .status(200)
      .json({
        message: "All problems solved fetched successfully",
        data: userproblem.problemSolved,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const runcode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    console.log("🔥 CODE SUBMISSION:", { userId, problemId });

    const { code, language } = req.body;
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send({
        message: "Please provide all the field",
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).send({
        message: "Problem not found for this id",
      });
    }

    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).json({
        error: `Unsupported language '${language}'`,
      });
    }

    const submissions = problem.visibleTestCases.map((testcase, index) => {
      return {
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      };
    });

    const submitResult = await submitBatch(submissions);
    if (!submitResult) {
      return res.status(500).json({ error: "Judge0 did not return tokens" });
    }

    const resultToken = submitResult.map((value) => value.token);

    const testResults = await submitToken(resultToken);

    return res.status(200).send({
      message: "Code run successfully",
      testResults
    });

    console.log("🔥 TEST RESULTS RECEIVED FROM JUDGE0:", testResults);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const DeleteuserProfile=async (req,res)=>{
  try{
   const user=req.user._id;
    await user.findByIdAndDelete(user);
    return res.status(200).json({
      message:"User profile deleted successfully"
    })

  }catch(error){
    return res.status(500).json({
      message: error.message,
    })
  }
}

export const submittedproblem=async(req,res)=>{
  try{
    const userId=req.user._id;
    const problemId=req.params.pid;
    const submissionofproblem=await submissioncode.find({userId,problemId}).sort({createdAt:-1});
    if(submissionofproblem.length===0){
      return res.status(404).json({
        message:"No submission found for this problem"
      })
    }
    return res.status(200).json({
      message:"Submissions fetched successfully",
      data:submissionofproblem
    })
  }catch(error){
    return res.status(500).json({
      message: error.message,
    })
  } 
}
