"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {

  // state to track if dropdown is open
  const [open,setOpen] = useState(false);

  // store username of logged-in user
  const [username,setUsername] = useState("Player");

  // fetch current user info when component mounts
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


  // handle user logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout",{ method:"POST" })
    window.location.href = "/login"
  }

  // logo text
  const logoText = "🍌 RUSH RACE";

  return (

   <nav className="w-full bg-yellow-100/30 backdrop-blur-md border-b border-yellow-200/50">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO with moving/glow effect */}
        <Link href="/">
          <span className="text-2xl font-bold logo-moving inline-block">
            {logoText}
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex gap-8 text-[#8B5E3C] font-medium"> 

          {/* Home Link with smooth yellow underline and text change on hover */}
          <Link href="/"><span className="nav-link">Home</span></Link>

          {/* Play Link with smooth yellow underline and text change on hover */}
          <Link href="/play"><span className="nav-link">Play</span></Link>

          {/* Leaderboard Link with smooth yellow underline and text change on hover */}
          <Link href="/leaderboard"><span className="nav-link">Leaderboard</span></Link>

        </div>

        {/* USER PROFILE */}
        <div className="relative">

          {/* avatar + username button */}
          <div
            onClick={()=>setOpen(!open)}
            className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer"
          >

            {/* avatar image */}
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
              className="w-8 h-8 rounded-full border-2 border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.6)]"
            />

            {/* username */}
            <span className="text-[#5C4033] font-medium">{username}</span> {/* dark brown color */}

          </div>

          {/* DROPDOWN MENU */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-black/60 backdrop-blur-md rounded-lg shadow-lg border border-white/10">

              {/* profile link */}
              <Link
                href="/profile"
                className="block px-4 py-2 text-white hover:bg-white/10"
              >
                Profile
              </Link>

              {/* logout button */}
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

      {/* LOGO animation & nav underline hover */}
      <style jsx>{`
        /* Logo animation: moves back and forth with small glow */
        @keyframes logoMove {
          0%,100% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          25% { transform: translateX(3px); text-shadow:0 0 6px #facc15; }
          50% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          75% { transform: translateX(-3px); text-shadow:0 0 6px #facc15; }
        }

        /* apply animation to logo */
        .logo-moving {
          display: inline-block; /* ensures transform works */
          animation: logoMove 2s ease-in-out infinite;
        }

        /* Smooth underline hover effect for nav links and text color change */
        .nav-link {
          position: relative; /* needed for ::after positioning */
          display: inline-block;
          padding-bottom: 2px; /* spacing between text and underline */
          transition: color 0.3s ease-in-out; /* smooth text color change */
        }

        /* underline pseudo-element, starts hidden */
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0%;
          height: 2px;
          background-color: #facc15; /* yellow underline on hover */
          transition: width 0.3s ease-in-out; /* smooth expand */
        }

        /* expand yellow underline and change text color to yellow on hover */
        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link:hover {
          color: #ffe476; /* text turns yellow on hover */
        }
      `}</style>

    </nav>

  );

}