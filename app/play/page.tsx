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

    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">

      <Navbar/>

      <div className="flex flex-col items-center justify-center mt-10">

        <h1 className="text-4xl font-bold mb-6">
          Rush Race Arena 🎮
        </h1>

        {/* pass userId to gameboard */}
        <GameBoard userId={userId}/>

      </div>

    </div>

  )

}
