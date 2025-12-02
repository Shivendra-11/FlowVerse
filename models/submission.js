import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'php']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'rejected','failed'],
        default: 'pending'
    },
    runtime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    errorMessage: {  // Fixed: Typo "errrorMessage" → "errorMessage"
        type: String,
        default: ''  
    },
    testCasesPassed: {  // Fixed: Camel case "testcasespassed" → "testCasesPassed"
        type: Number,
        default: 0
    },
    totalTestCases: {  // Fixed: Camel case "totalTestcases" → "totalTestCases"
        type: Number,
        default: 0   
    }
}, {
    timestamps: true 
});
submissionSchema.index({ userId: 1, problemId: 1 });    

export default mongoose.model('Submission', submissionSchema);