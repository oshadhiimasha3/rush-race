import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema({

userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
username:String,
score:Number

},{timestamps:true})

export default mongoose.models.Leaderboard ||
mongoose.model("Leaderboard",LeaderboardSchema)