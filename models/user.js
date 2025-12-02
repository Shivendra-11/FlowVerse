import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:20
    },
    lastName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        maxLength:64
    },
    age:{
        type:Number,
        min:10,
        max:80
    },
    role:{
       type:String,
         enum:['user','admin'],
         default:'user'
    },
    problemSolved:{
        type:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Problem'
        }]
    }
},
{
    timestamps:true
});

UserSchema.post('findOneAndDelete',async function(UserInfo){
    if(UserInfo){
      await mongoose.model('Submission').deleteMany({user:UserInfo._id});   
    }
});

export default mongoose.model('User',UserSchema);
