import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Get top 10 users by highestScore descending
    const topUsers = await User.find({})
      .sort({ "stats.highestScore": -1 })
      .limit(10)
      .select({ username: 1, "stats.highestScore": 1 });

    // Map to simplified object
    const leaderboard = topUsers.map(user => ({
      _id: user._id,
      username: user.username,
      highestScore: user.stats.highestScore
    }));

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}