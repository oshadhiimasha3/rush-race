"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { audioEngine } from "@/lib/audioEngine";

export default function Navbar() {

  const [open,setOpen] = useState(false);
  const [username,setUsername] = useState("Player");
  const [isMusicOn, setIsMusicOn] = useState(true);

  const [showLoader, setShowLoader] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing Race ...");
  const [tick, setTick] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{top:number,left:number}>({top:0,left:0});

  const router = useRouter();

  const handleNavigation = (path: string, text: string) => {
    setLoadingText(text);
    setShowLoader(true);
    setTick(0);

    setTimeout(() => {
      if (window.location.pathname === path) {
        window.location.href = path;
      } else {
        router.push(path);
      }
    }, 2000);
  };

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

    setIsMusicOn(audioEngine.isBgMusicEnabled());

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

  useEffect(() => {
    if (!showLoader) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 800);

    return () => clearInterval(interval);
  }, [showLoader]);

  // Calculate centered dropdown position
  useEffect(()=>{
    if(open && profileRef.current && dropdownRef.current){
      const profileRect = profileRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const top = profileRect.bottom + 4; // small gap
      const left = profileRect.left + profileRect.width/2 - dropdownRect.width/2;
      setDropdownPos({top,left});
    }
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout",{ method:"POST" })
    window.location.href = "/login"
  }

  const handleMusicToggle = () => {
    const newState = audioEngine.toggleBgMusic();
    setIsMusicOn(newState);
  }

  const handlePlayClick = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        handleNavigation("/game-map", "Loading Rush Map...");
      } else {
        handleNavigation("/login", "Redirecting...");
      }
    } catch {
      handleNavigation("/login", "Redirecting...");
    }
  }

  const logoText = "🍌 RUSH RACE";

  return (
   <>
    <nav className="w-full bg-transparent backdrop-blur-md border-b border-white/10 relative z-[50]">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO */}
        <button onClick={() => handleNavigation("/", "Loading Rush Base...")}>
          <span className="text-2xl font-bold logo-moving inline-block text-white">
            {logoText}
          </span>
        </button>

        {/* NAV LINKS */}
        <div className="flex gap-8 text-white font-medium"> 

          <button
            onClick={() => handleNavigation("/", "Loading Rush Base...")}
            className="nav-link bg-transparent border-none cursor-pointer"
          >
            Home
          </button>

          <button
            onClick={handlePlayClick}
            className="nav-link bg-transparent border-none cursor-pointer"
          >
            Play
          </button>

          <button
            onClick={() => handleNavigation("/leaderboard", "Loading Rush Rankings...")}
            className="nav-link bg-transparent border-none cursor-pointer"
          >
            Leaderboard
          </button>

        </div>

        {/* MUSIC BUTTON */}
        <button
          onClick={handleMusicToggle}
          className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 cursor-pointer group"
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
        <div ref={profileRef} className="relative">
          <div
            onClick={()=>setOpen(!open)}
            className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer backdrop-blur-md"
          >
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
              className="w-8 h-8 rounded-full border-2 border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.6)]"
            />
            <span className="text-white font-medium">{username}</span>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes logoMove {
          0%,100% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          25% { transform: translateX(3px); text-shadow:0 0 6px #facc15; }
          50% { transform: translateX(0); text-shadow:0 0 2px #facc15; }
          75% { transform: translateX(-3px); text-shadow:0 0 6px #facc15; }
        }

        .logo-moving {
          animation: logoMove 2s ease-in-out infinite;
        }

        .nav-link {
          position: relative;
          padding-bottom: 2px;
          transition: color 0.3s ease-in-out;
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
      `}</style>

    </nav>

    {/* PROFILE DROPDOWN - FIXED & CENTERED */}
    {open && (
      <div
        ref={dropdownRef}
        className="fixed w-40 bg-white/10 backdrop-blur-lg mt-3 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/10 z-[1100]"
        style={{ top: dropdownPos.top, left: dropdownPos.left }}
      >
        <Link
          href="/profile"
          className="block px-4 py-2 text-white hover:bg-white/20 transition"
        >
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/20 transition"
        >
          Logout
        </button>
      </div>
    )}

    {/* LOADER */}
    {showLoader && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#01061C] overflow-hidden">

        {/* Neon star background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <span
              key={`${i}-${tick}`}
              className="absolute w-[2px] h-[2px] rounded-full bg-white/80 animate-pulse-neon"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                opacity: 0.7 + Math.random() * 0.3,
                boxShadow: `0 0 ${1 + Math.random() * 2}px rgba(255,255,255,0.8)`
              }}
            />
          ))}
        </div>

        {/* Loader */}
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative w-24 h-24 rounded-full border-4 border-purple-400/30 flex items-center justify-center animate-spin-slow">
            <div className="absolute w-20 h-20 border-4 border-t-purple-400 border-purple-400/40 rounded-full animate-spin-neon"></div>
            <div className="absolute w-16 h-16 border-2 border-t-purple-300 border-purple-300/50 rounded-full animate-pulse-neon"></div>
          </div>

          <p className="text-white text-xl opacity-80 tracking-wider glow-text text-center">
            {loadingText}
          </p>
        </div>
      </div>
    )}
   </>
  );
}