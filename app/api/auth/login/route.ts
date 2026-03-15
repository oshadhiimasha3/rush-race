import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    await connectDB()

    const { email, password } = await req.json()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 404 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check again" },
        { status: 401 }
      )
    }

    const response = NextResponse.json(
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

    // 🍪 set login cookie
    response.cookies.set("userId", user._id.toString(), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    })

    return response

  } catch {

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}