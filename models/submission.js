import mongoose from "mongoose";

const submissionschema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    problemId:{
        ref:'Problem',
        type:Schema.Types.ObjectId,
        required:true
    },
    code:{
        type:String,
        required:true

    },
    language:{
        type:String,
        required:true,
        enum:['python','javascript','java','c++','c#','ruby','go','php']
    },
    status:{
        type:String,
        required:true,
        enum:['pending','accepted','rejected'],
        default:'pending'
    },
    runtime:{
        type:Number,
        default:0
    
    },
    memory:{
        type:Number,
        default:0
    },
    errrorMessage:{
        type:String,
        default:''  
    },
    testcasespassed:{
        type:Number,
        default:0
    },
    totalTestcases:{
        type:Number,
        default:0   
    }
},
{
    timestamps:true 
});

export default mongoose.model('Submission',submissionschema);

