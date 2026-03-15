import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({

userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
score:Number,
correctAnswers:Number,
wrongAnswers:Number,
duration:Number

},{timestamps:true})

export default mongoose.models.Game || mongoose.model("Game",GameSchema)