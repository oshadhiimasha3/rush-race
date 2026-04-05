"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { audioEngine } from "@/lib/audioEngine"; // Adjust the import path as needed

export default function Navbar() {

  // state to track if dropdown is open
  const [open,setOpen] = useState(false);

  // store username of logged-in user
  const [username,setUsername] = useState("Player");

  // state for music button
  const [isMusicOn, setIsMusicOn] = useState(true);

  // router for navigation
  const router = useRouter();

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

    // Initialize music state from audioEngine
    setIsMusicOn(audioEngine.isBgMusicEnabled());

    // Resume audio context on first user interaction
    const handleFirstInteraction = async () => {
      await audioEngine.resumeContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  },[])

  // handle user logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout",{ method:"POST" })
    window.location.href = "/login"
  }

  // handle music toggle
  const handleMusicToggle = () => {
    const newState = audioEngine.toggleBgMusic();
    setIsMusicOn(newState);
  }

  // handle play button click
  const handlePlayClick = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        // user logged in → go to game map
        router.push("/game-map");
      } else {
        // not logged in → go to login
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }

  // logo text
  const logoText = "🍌 RUSH RACE";

  return (

   <nav className="w-full bg-transparent backdrop-blur-md border-b border-white/10">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO with moving/glow effect */}
        <Link href="/">
          <span className="text-2xl font-bold logo-moving inline-block text-white">
            {logoText}
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex gap-8 text-white font-medium"> 

          {/* Home Link with smooth underline and text change on hover */}
          <Link href="/"><span className="nav-link">Home</span></Link>

          {/* Play Link with smooth underline and login check */}
          <button
            onClick={handlePlayClick}
            className="nav-link bg-transparent border-none cursor-pointer"
          >
            Play
          </button>

          {/* Leaderboard Link with smooth underline */}
          <Link href="/leaderboard"><span className="nav-link">Leaderboard</span></Link>

        </div>

        {/* MUSIC TOGGLE BUTTON */}
        <button
          onClick={handleMusicToggle}
          className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 cursor-pointer group"
          title={isMusicOn ? "Turn music off" : "Turn music on"}
        >
          <span className="text-xl">
            {isMusicOn ? "🎵" : "🔇"}
          </span>
          <span className="text-white/90 font-medium text-sm hidden sm:inline">
            {isMusicOn ? "Music On" : "Music Off"}
          </span>
          <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_12px_rgba(250,204,21,0.3)] pointer-events-none"></span>
        </button>

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
            <span className="text-white font-medium">{username}</span>

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
        @keyframes logoMove {
          0%,100% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          25% { transform: translateX(3px); text-shadow:0 0 6px #facc15; }
          50% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          75% { transform: translateX(-3px); text-shadow:0 0 6px #facc15; }
        }

        .logo-moving {
          display: inline-block;
          animation: logoMove 2s ease-in-out infinite;
          color: white;
        }

        .nav-link {
          position: relative;
          display: inline-block;
          padding-bottom: 2px;
          transition: color 0.3s ease-in-out;
          color: white;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0%;
          height: 2px;
          background-color: white;
          transition: width 0.3s ease-in-out;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link:hover {
          color: #fff;
        }
      `}</style>

    </nav>

  );

}