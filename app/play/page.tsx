"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import GameBoard from "../../components/GameBoard";

export default function Play(){

  const router = useRouter();

  // check login
  useEffect(()=>{

    const user = localStorage.getItem("user");

    if(!user){
      router.push("/login");
    }

  },[router]);


  // function to update score in database
  const handleGameEnd = async(score:number, correctAnswers:number)=>{

    const storedUser = localStorage.getItem("user");

    if(!storedUser) return;

    const user = JSON.parse(storedUser);

    try{

      await fetch("/api/game/updateScore",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          userId:user.id,
          score:score,
          correctAnswers:correctAnswers
        })
      })

    }catch(error){

      console.log("Score update failed")

    }

  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">

      <Navbar/>

      <div className="flex flex-col items-center justify-center mt-10">

        <h1 className="text-4xl font-bold mb-6">
          Rush Race Arena 🎮
        </h1>

        {/* pass function to GameBoard */}
        <GameBoard onGameEnd={handleGameEnd}/>

      </div>

    </div>

  )

}