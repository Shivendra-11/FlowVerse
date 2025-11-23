import { getLanguageId, submitBatch } from "../utils/LanguagaeId";


export const createproblem=async(req,res)=>{
   try{
    const {title,description,difficulty,tags,starterCode,referenceCode,visibleTestCases,hiddenTestCases}=req.body;

    if(!title || !description || !difficulty || !tags || !starterCode || !referenceCode || !visibleTestCases || !hiddenTestCases){
        return res.status(400).json({message:"All fields are required"});
    }

    for(const {language,CompleteCode} of starterCode){
        const languageId=getLanguageId(language);
   
        const submission=visibleTestCases.map((input,output)=({
                   source_id:CompleteCode,
                   language_id:languageId,
                   stdin:input,
                   expected_output:output
        }));
    }

    const submitresult = await submitBatch(submission);




   }catch(err){
        res.status(500).json({message:"Server Error",error:err.message});
   }
}