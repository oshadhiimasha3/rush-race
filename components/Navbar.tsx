"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {

  const [open,setOpen] = useState(false);
  const [username,setUsername] = useState("Player");

  useEffect(()=>{

    const fetchUser = async () => {

      try{

        const res = await fetch("/api/auth/me")

        if(!res.ok) return

        const data = await res.json()

        setUsername(data.username)

      }catch{
        console.log("User fetch failed")
      }

    }

    fetchUser()

  },[])


  const handleLogout = async () => {

    await fetch("/api/auth/logout",{
      method:"POST"
    })

    window.location.href = "/login"

  }

  const logoText = "🍌 RUSH RACE";

  return (

    <nav className="w-full bg-black/40 backdrop-blur-md border-b border-white/10">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl hover:text-yellow-400 transition font-bold logo-moving"
        >
          {logoText}
        </Link>


        {/* NAV LINKS */}
        <div className="flex gap-8 text-white font-medium">

          <Link href="/" className="hover:text-yellow-300 transition">
            Home
          </Link>

          <Link href="/play" className="hover:text-yellow-300 transition">
            Play
          </Link>

          <Link href="/leaderboard" className="hover:text-yellow-300 transition">
            Leaderboard
          </Link>

        </div>


        {/* PROFILE */}
        <div className="relative">

          <div
            onClick={()=>setOpen(!open)}
            className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer"
          >

            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
              className="w-8 h-8 rounded-full border-2 border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.6)]"
            />

            <span className="text-white font-medium">
              {username}
            </span>

          </div>


          {open && (

            <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-md rounded-lg shadow-lg border border-white/10">

              <Link
                href="/profile"
                className="block px-4 py-2 text-white hover:bg-white/10"
              >
                Profile
              </Link>

              <Link
                href="/scores"
                className="block px-4 py-2 text-white hover:bg-white/10"
              >
                My Scores
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
              >
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </nav>

  );

}
