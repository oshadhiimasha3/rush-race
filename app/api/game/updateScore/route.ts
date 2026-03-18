import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { NextResponse } from "next/server"

export async function POST(req: Request){

  try{

    await connectDB()

    const { userId, score, correctAnswers = 0 } = await req.json() // frontend sends the userId, score, and correctAnswers

    if(!userId){
      return NextResponse.json(
        { error:"User ID missing" },
        { status:400 }
      )
    }

    const user = await User.findById(userId)

    if(!user){
      return NextResponse.json(
        { error:"User not found" },
        { status:404 }
      )
    }

    user.stats.totalScore += score
    user.stats.gamesPlayed += 1
    user.stats.correctAnswers += correctAnswers

    if(score > user.stats.highestScore){
      user.stats.highestScore = score
    }

    await user.save() //Saves the updated stats back to the database.

    return NextResponse.json(
      {
        message:"Score updated",
        stats:user.stats
      },
      { status:200 }
    )

  }catch(error){

    console.log("Score update error:", error)

    return NextResponse.json(
      { error:"Failed to update score" },
      { status:500 }
    )

  }

}