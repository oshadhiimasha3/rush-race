import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "DB connection successful",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
    });
  }
}