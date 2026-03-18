import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    await connectDB()

    const { email, password } = await req.json() //gets the email and password from login form

    const user = await User.findOne({ email })  //The system checks if a user with this email exists in the database

    if (!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 404 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)  //checks if password match hashed password in db

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
          email: user.email    // sends back a success message with basic user info
        }
      },
      { status: 200 }
    )

    //  set login cookie
    response.cookies.set("userId", user._id.toString(), {
      httpOnly: true,
      path: "/", //cookie is accessible across the whole site
      maxAge: 60 * 60 * 24 // cookie lasts 1 day
    })

    return response

  } catch {

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}