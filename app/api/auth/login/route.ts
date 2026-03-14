import { connectDB } from "../../../../lib/mongodb"
import User from "../../../../models/User"
import bcrypt from "bcryptjs"
import { createToken } from "../../../../lib/auth"

export async function POST(req: Request){

  try{

    await connectDB()

    const body = await req.json()

    const {email,password} = body

    const user = await User.findOne({email})

    if(!user){
      return new Response(JSON.stringify({error:"User not found"}),{status:400})
    }

    const match = await bcrypt.compare(password,user.password)

    if(!match){
      return new Response(JSON.stringify({error:"Wrong password"}),{status:400})
    }

    const token = createToken(user._id.toString())

    return new Response(JSON.stringify({token}),{status:200})

  }catch(err){

    return new Response(JSON.stringify({error:"Login failed"}),{status:500})

  }

}