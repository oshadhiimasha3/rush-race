import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import GameBoard from "../../components/GameBoard";
import { STAGES } from "../../lib/stages";

export default async function Play() {

  const cookieStore = await cookies(); //Reads the userId cookie stored after login.
  const userCookie = cookieStore.get("userId");  //This is how the page knows who the current user is.

  // if not logged in redirect
  if(!userCookie){
    redirect("/login");
  }

  const userId = userCookie.value;

  // default stage config (Stage 1)
  const stageConfig = STAGES[0]; // load first stage by default

  return(
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 text-gray-900">

      {/* Navbar */}
      <Navbar/>

      <div className="flex flex-col items-center justify-center mt-5">

        {/* pass userId and stageConfig to gameboard */}
        <GameBoard userId={userId} stageConfig={stageConfig}/>

      </div>

    </div>
  )
}