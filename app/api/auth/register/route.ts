import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {

  try {

    await connectDB();

    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      }),
      { status: 201 }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({ error: "Registration failed" }),
      { status: 500 }
    );

  }
}


/* Retrieve all registered users */

export async function GET() {

  try {

    await connectDB();

    const users = await User.find().select("-password");

    return new Response(
      JSON.stringify(users),
      { status: 200 }
    );

  } catch {

    return new Response(
      JSON.stringify({ error: "Failed to fetch users" }),
      { status: 500 }
    );

  }

}