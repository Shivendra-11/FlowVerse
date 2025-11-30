import Problem from "../models/problem";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/LanguagaeId";
import submissioncode from "../models/submission.js";
export const submissioncode = async (req, res) => {
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

    const problem = await Problem.findById({ problemId });
    if (!problem) {
      return res.status(404).send({
        message: "Problem not found for this id",
      });
    }

    await submissioncode.create({
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

    const submissions = visibleTestCases.map((testcase, index) => {
      return {
        source_code: completeCode,
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
    let status = "passed";
    let runtime = 0;
    let memory = 0;
    let errormessage = null;

    for (test of testResults) {
      if (test.status.id === 3) {
        testcasepassed += 1;
        runtime = runtime + ParseFloat(test.time);
        memory = Math.max(memory, test.memory);
        errormessage = null;
      } else {
        if (test.status.id === 4) {
          status = "failed";
          errormessage = test.stderr;
          break;
        }
      }
    }

    submissioncode.status = status;
    submissioncode.runtime = runtime;
    submissioncode.memory = memory;
    submissioncode.errormessage = errormessage;
    submissioncode.testcasespassed = testcasepassed;
    submissioncode.totalTestcases = problem.testcases.length;

    await submissioncode.save();

    return res.status(200).send({
      message: "Code submitted successfully",
      submissioncode,
    }); 

    console.log("🔥 TEST RESULTS RECEIVED FROM JUDGE0:", testResults);
  } catch (err) {
    return res.status(400).send({
      message: "unable to submit the code due to server error",
      error: err.message,
    });
  }
};
