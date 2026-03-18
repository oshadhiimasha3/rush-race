import { cookies } from "next/headers"
import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { NextResponse } from "next/server"

export async function GET(){  //defines a GET API route that the frontend can call to get the current logged-in user’s info

  const cookieStore = await cookies() //The system checks the browser for the userId cookie
  const userCookie = cookieStore.get("userId")

  if(!userCookie){
    return NextResponse.json({ error:"Not logged in" },{ status:401 })
  }

  await connectDB()

  const user = await User.findById(userCookie.value) //Looks up the user by the userId stored in the cookie

  if(!user){
    return NextResponse.json({ error:"User not found" },{ status:404 })
  }

  return NextResponse.json({  //Sends back the user’s information 
    username:user.username,
    email:user.email,
    stats:user.stats 
  })

}