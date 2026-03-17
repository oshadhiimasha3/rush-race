import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import GameBoard from "../../components/GameBoard";

export default async function Play(){

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("userId");

  // if not logged in redirect
  if(!userCookie){
    redirect("/login");
  }

  const userId = userCookie.value;

  return(
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 text-gray-900">

      {/* Navbar */}
      <Navbar/>

      <div className="flex flex-col items-center justify-center mt-5">

        {/* pass userId to gameboard */}
        <GameBoard userId={userId}/>

      </div>

    </div>
  )
}