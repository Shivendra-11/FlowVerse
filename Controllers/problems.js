import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/LanguagaeId.js";
import Problem from "../models/problem.js";
import solutionVideo from "../models/solutionVideo.js";

export const createProblem = async (req, res) => {
  try {
    const {
     title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    } = req.body;

    if (!referenceSolution || !Array.isArray(referenceSolution)) {
      return res
        .status(400)
        .json({ error: "referenceSolution must be an array" });
    }

    for (const { language, completeCode } of referenceSolution) {
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

      console.log("🔥 SUBMISSIONS SENT TO JUDGE0:");
      console.log(JSON.stringify(submissions, null, 2));
      
      const submitResult = await submitBatch(submissions);

      console.log("🔥 TOKENS RECEIVED FROM JUDGE0:");
      console.log(JSON.stringify(submitResult, null, 2));

      if (!submitResult) {
        return res.status(500).json({ error: "Judge0 did not return tokens" });
      }

      const resultToken = submitResult.map((value) => value.token);

      // ---------------------------------------------
      // FETCH RESULTS USING TOKENS
      // ---------------------------------------------
      const testResults = await submitToken(resultToken);

      console.log("🔥 FULL RESULTS FROM JUDGE0:");
      console.log(JSON.stringify(testResults, null, 2));

      if (!Array.isArray(testResults)) {
        return res.status(500).json({
          error: "Judge0 returned invalid result format",
          raw: testResults,
        });
      }

      // ---------------------------------------------
      // CHECK EACH TEST RESULT
      // ---------------------------------------------
      for (let i = 0; i < testResults.length; i++) {
        const test = testResults[i];

        if (!test) {
          console.log(`⚠️ JUDGE0 returned NULL for test case ${i}`);
          return res.status(500).json({
            error: `Judge0 returned NULL for test ${i}`,
            allResults: testResults,
          });
        }

        console.log(`🔥 RESULT FOR TEST CASE #${i + 1}:`);
        console.log(JSON.stringify(test, null, 2));

        if (test.status_id !== 3) {
          return res.status(400).json({
            error: `Test case #${i + 1} failed`,
            judge0Result: test,
            allResults: testResults,
          });
        }
      }
    }

    const existingProblem = await Problem.findOne({ title: title });
    if (existingProblem) {
      return res.status(400).json({
        error: "Problem with this title already exists",
        message: "Please choose a different title",
      });
    }
    const createdProblem = await Problem.create({
      ...req.body,
      problemCreator: req.user.id,
    });

    return res.status(201).json({
      message: "Problem Created Successfully",
      data: createdProblem,
    });
  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const ProblemUpdate = async (req, res) => {
  try {

      const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    } = req.body;


    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Problem id is required in params",
      });
    }

    const existing = await Problem.findById(id);

    if (!existing) {
      return res.status(404).json({ error: "Problem not found" });
    }

   
    if (!referenceSolution || !Array.isArray(referenceSolution)) {
      return res.status(400).json({
        error: "referenceSolution must be an array",
      });
    }

    if (!visibleTestCases || !Array.isArray(visibleTestCases)) {
      return res.status(400).json({
        error: "visibleTestCases must be an array",
      });
    }

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Unsupported language '${language}'`,
        });
      }

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      console.log("🔥 SUBMISSIONS SENT TO JUDGE0:");
      console.log(JSON.stringify(submissions, null, 2));

      const submitResult = await submitBatch(submissions);

      console.log("🔥 TOKENS RECEIVED FROM JUDGE0:");
      console.log(JSON.stringify(submitResult, null, 2));

      if (!submitResult) {
        return res.status(500).json({ error: "Judge0 did not return tokens" });
      }

      const resultToken = submitResult.map((v) => v.token);

      const testResults = await submitToken(resultToken);

      console.log("🔥 FULL RESULTS FROM JUDGE0:");
      console.log(JSON.stringify(testResults, null, 2));

      if (!Array.isArray(testResults)) {
        return res.status(500).json({
          error: "Judge0 returned invalid format",
          raw: testResults,
        });
      }

      for (let i = 0; i < testResults.length; i++) {
        const test = testResults[i];

        if (!test) {
          return res.status(500).json({
            error: `Judge0 returned NULL at index ${i}`,
            allResults: testResults,
          });
        }

        if (test.status_id !== 3) {
          return res.status(400).json({
            error: `Test case #${i + 1} failed`,
            judge0Result: test,
            allResults: testResults,
          });
        }
      }
    }

    // ---------------------------------------------
    // AFTER ALL TESTS PASS → UPDATE
    // ---------------------------------------------
    const updated = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Problem updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("🔥 UPDATE ERROR:", error);
    return res.status(500).json({
      error: error.message,
      message: "Error while updating problem",
    });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    // Get id from URL params, not body
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required",
      });
    }

    const existingProblem = await Problem.findById(id);

    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    await Problem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
      data: {
        deletedId: id
      }
    });
  } catch (err) {
    console.error("Error deleting problem:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting problem",
      error: err.message,
    });
  }
};

export const getProblemById = async (req, res) => {
  try{
     const {id}=req.params;

     if(!id){
    return res.status(400).json({
      success:false,
      message:"Problem ID is required"
    });
     }

      const problem = await Problem.findById(id);

      if(!problem){
        return res.status(404).json({
          success:false,
          message:"Problem not found"
        });
      }  

      const solutionvideo=await solutionVideo.findOne({problemId:id});

      if(solutionvideo){
        problem.cloudinaryPublicId=solutionvideo.cloudinaryPublicId;
        problem.secureUrl=solutionvideo.secureUrl;
        problem.thumbnailUrl=solutionvideo.thumbnailUrl;
        problem.duration=solutionvideo.duration;

        return res.status(200).json({
        success:true,
        data:problem
        
        });
      }

      return res.status(200).json({
        success:true,
        data:problem
      }); 

  }catch(err){
    console.error("Error fetching problem:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching problem",
      error: err.message,
    });
  }
}

export const getAllProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problems = await Problem.find({})
      .select('title description difficulty tags')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); 

    const total = await Problem.countDocuments();

    return res.status(200).json({
      success: true,
      count: problems.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: problems
    });
  } catch (err) {
    console.error("Error fetching all problems:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching all problems",
      error: err.message,
    });
  }
};