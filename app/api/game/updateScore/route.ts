import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { NextResponse } from "next/server"

export async function POST(req: Request){

  try{

    await connectDB()

    const { userId, score, correctAnswers } = await req.json()

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

    await user.save()

    return NextResponse.json(
      { message:"Score updated", stats:user.stats },
      { status:200 }
    )

  }catch{

    return NextResponse.json(
      { error:"Failed to update score" },
      { status:500 }
    )

  }

}