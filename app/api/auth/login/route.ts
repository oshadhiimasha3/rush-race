import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    await connectDB()

    const { email, password } = await req.json()

    // check if user exists
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 404 }
      )
    }

    // check password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check again" },
        { status: 401 }
      )
    }

    // login success
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      },
      { status: 200 }
    )

  } catch (error) {

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}