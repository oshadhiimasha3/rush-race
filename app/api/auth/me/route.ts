import { cookies } from "next/headers"
import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { NextResponse } from "next/server"

export async function GET(){

  const cookieStore = await cookies()
  const userCookie = cookieStore.get("userId")

  if(!userCookie){
    return NextResponse.json({ error:"Not logged in" },{ status:401 })
  }

  await connectDB()

  const user = await User.findById(userCookie.value)

  if(!user){
    return NextResponse.json({ error:"User not found" },{ status:404 })
  }

  return NextResponse.json({
    username:user.username,
    email:user.email
  })

}