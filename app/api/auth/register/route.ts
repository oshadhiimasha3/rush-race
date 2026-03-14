import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

  try{

    await connectDB()

    const body = await req.json()

    const {username,email,password} = body

    const hash = await bcrypt.hash(password,10)

    const user = await User.create({
      username,
      email,
      password:hash
    })

    return new Response(JSON.stringify(user),{
      status:200
    })

  }catch(err){

    return new Response(JSON.stringify({error:"Registration failed"}),{
      status:500
    })

  }

}