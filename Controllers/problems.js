import user from "../models/user.js";
import  AdminMiddleware  from "../middleware/AdminMiddleware.js";
import { getLanguageId, submitBatch ,submitTokenres} from "../utils/LanguagaeId.js";


export const createproblem=async(req,res)=>{
   try{
    const {title,description,difficulty,tags,starterCode,referenceCode,visibleTestCases,hiddenTestCases}=req.body;

    if(!title || !description || !difficulty || !tags || !starterCode || !referenceCode || !visibleTestCases || !hiddenTestCases){
        return res.status(400).json({message:"All fields are required"});
    }

    for(const {language,CompleteCode} of starterCode){
        const languageId=getLanguageId(language);
   
        const submission=visibleTestCases.map((element,index)=>({
                   source_id:CompleteCode,
                   language_id:languageId,
                   stdin:element.input,
                   expected_output:element.output
        }));

         const submitresult = await submitBatch(submission);
    const submitToken=submitresult.map((res)=>res.token);
    const submissionResult=await submitTokenres(submitToken);

    for(const result of submissionResult){
        if(result.status.id!==3){
            return res.status(400).json({message:"Starter code does not pass all visible test cases. Please check and try again."});
        }
        if(result.status.id===5){
        return res.status(400).json({message:"Starter code failed on visible test cases. Please check and try again."});    
    }
    }
    }

    await userProblem.create({
        ...req.body,
        problemCreator:req.user.id
    });
    res.status(201).json({message:"Problem created successfully"});
   }catch(err){
        res.status(500).json({message:"Server Error",error:err.message});
   }
}