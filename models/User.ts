import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

username:{type:String,required:true,unique:true},
email:{type:String,required:true,unique:true},
password:{type:String,required:true},

stats:{
totalScore:{type:Number,default:0},
gamesPlayed:{type:Number,default:0},
highestScore:{type:Number,default:0},
correctAnswers:{type:Number,default:0}
}

},{timestamps:true})

export default mongoose.models.User || mongoose.model("User",UserSchema)