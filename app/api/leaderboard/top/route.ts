import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

  
    const topUsers = await User.find({}) //fetches all users
      .sort({ "stats.highestScore": -1 }) //sorts users descending by highest score
      .limit(10) //keeps only the top 10 users
      .select({ username: 1, "stats.highestScore": 1 }); //returns only the username and highestScore

    // Map to simplified object
    const leaderboard = topUsers.map(user => ({
      _id: user._id,
      username: user.username,
      highestScore: user.stats.highestScore
    }));

    return NextResponse.json(leaderboard, { status: 200 }); //Sends the top 10 leaderboard entries back to the frontend
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}