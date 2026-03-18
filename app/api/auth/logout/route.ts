import { NextResponse } from "next/server"

export async function POST() {  //listens for sent POST requests

  const response = NextResponse.json({ message: "Logged out" })  //Sends back a logged out message

  response.cookies.set("userId", "", {  //Sets the userId cookie to an empty value and maxAge to 0, which deletes the cookie  removing identity from the browser
    path: "/",
    maxAge: 0
  })

  return response
 
}