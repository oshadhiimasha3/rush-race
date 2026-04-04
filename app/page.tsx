"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";

type LeaderboardEntry = {
  _id: string;
  username: string;
  highestScore: number;
};

export default function Home() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/top");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaders(data.slice(0, 10));
      } catch {
        setError("Failed to load leaderboard. Try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos(prev => ({
        x: prev.x + (e.clientX - prev.x) * 0.2,
        y: prev.y + (e.clientY - prev.y) * 0.2,
      }));
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Track all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], .coin-card, .nav-link');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  let currentRank = 1;
  const rankedLeaders = leaders.map((player, index) => {
    if (index === 0) return { ...player, rank: 1 };
    if (player.highestScore === leaders[index - 1].highestScore)
      return { ...player, rank: currentRank };
    currentRank += 1;
    return { ...player, rank: currentRank };
  });

  const top3 = rankedLeaders.slice(0, 3);
  const getAvatar = (username: string) =>
    `https://api.dicebear.com/7.x/pixel-art/png?seed=${username}`;

  // Scroll effect for alive background
  useEffect(() => {
    const section = document.getElementById("live-bg-section");
    const handleScroll = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollPercent = Math.min(
        Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
        1
      );
      section.style.backgroundPosition = `center ${10 + scrollPercent * 20}%`;
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pop-in animation for coin cards
  useEffect(() => {
    const wrappers = document.querySelectorAll<HTMLElement>(".scroll-wrapper");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wrapper = entry.target as HTMLElement;
          const delay = wrapper.getAttribute("data-delay") || "0";
          wrapper.style.transition = `all 0.6s cubic-bezier(0.68,-0.55,0.27,1.55) ${delay}s`;
          if (entry.isIntersecting) {
            wrapper.style.opacity = "1";
            wrapper.style.transform = "translateY(0) scale(1)";
          } else {
            wrapper.style.opacity = "0";
            wrapper.style.transform = "translateY(50px) scale(0.8)";
          }
        });
      },
      { threshold: 0.3 }
    );

    wrappers.forEach((wrapper, index) => {
      wrapper.style.opacity = "0";
      wrapper.style.transform = "translateY(50px) scale(0.8)";
      wrapper.setAttribute("data-delay", `${index * 0.2}`);
      observer.observe(wrapper);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-x-hidden cursor-none">
      
      {/* Custom Banana Cursor */}
      <div 
        className="fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-20%, -20%)'
        }}
      >
        <div className={`relative transition-all duration-200 ${isHovering ? 'scale-150' : 'scale-100'}`}>
          {/* Realistic Banana Shape */}
          <img
            src="/banana.png"
            alt="banana cursor"
            className="pointer-events-none select-none"
            style={{
              width: isHovering ? "55px" : "40px",
              height: "auto",
              transform: isHovering ? "rotate(25deg)" : "rotate(15deg)",
              transition: "all 0.2s ease"
            }}
          />
          {/* Hover ring effect */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-yellow-400 transition-all duration-200 ${isHovering ? 'w-14 h-14 opacity-100' : 'w-0 h-0 opacity-0'}`}></div>
        </div>
      </div>

      {/* VIDEO (behind everything) */}
      <div className="fixed top-0 left-0 w-full h-[120vh] overflow-hidden -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bg-game.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* NAVBAR */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* HERO + CARDS + LEADERBOARD */}
      <div className="relative z-10 mt-24 px-6 flex flex-col items-center">

        {/* Heading */}
        <h1 className="text-7xl font-extrabold mb-6 drop-shadow-[0_0_25px_rgba(255,255,0,1)] text-center">
          🍌 RUSH RACE
        </h1>
        <p className="text-xl max-w-2xl mb-10 text-center">
          Solve puzzles fast, earn points, and dominate the leaderboard.
        </p>

        {/* CARDS + BUTTON + LEADERBOARD */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 md:px-20 mb-20 w-full">

          {/* Instructions Card */}
          <div className="flex-1 max-w-[460px] h-[300px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold mb-2 text-center">Game Flow</h3>
            <div className="mx-auto mb-8 w-16 h-1 bg-white/20 rounded-full"></div>
            <div className="space-y-4">
              {/* Stage 1 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-white/50 mr-2"></span>
                  <span className="flex-1">Warm-Up Phase</span>
                  <span className="text-xs">Unlocks at 50 points</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[25%]"></div>
                </div>
              </div>
              {/* Stage 2 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-white/50 mr-2"></span>
                  <span className="flex-1">Speed Rush</span>
                  <span className="text-xs">Push to 100 points</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400 w-[50%]"></div>
                </div>
              </div>
              {/* Stage 3 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-white/50 mr-2"></span>
                  <span className="flex-1">Final Sprint</span>
                  <span className="text-xs">Go beyond 100 points</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-300 w-[75%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <div className="flex items-center justify-center md:mx-20">
            <Link href="/login">
              <button className="relative flex items-center justify-center border border-white/20 bg-white/5 text-white font-bold px-12 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300">
                Play Now &rarr;
                <span className="absolute inset-0 rounded-full opacity-20 bg-white/20 animate-ping"></span>
              </button>
            </Link>
          </div>

          {/* Leaderboard */}
          <div className="flex-1 max-w-[500px] h-[300px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg transition">
            <h3 className="text-xl font-bold mb-2 text-center">Top Rushers</h3>
            <div className="mx-auto mb-6 w-16 h-1 bg-white/20 rounded-full"></div>
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : (
              <div className="space-y-3 overflow-y-auto h-[220px]">
                {top3.map((player, index) => (
                  <div
                    key={player._id}
                    className="flex items-center gap-3 bg-white/20 p-2 rounded-xl hover:scale-95 hover:bg-white/30 transition-transform duration-200"
                  >
                    <span className="text-sm font-bold w-4 text-right">{index + 1}.</span>
                    <img
                      src={getAvatar(player.username)}
                      className="w-10 h-10 rounded-full border-2 border-yellow-300"
                    />
                    <div className="flex-1 flex justify-between items-center pr-4">
                      <p className="font-bold text-sm">{player.username}</p>
                      <p className="text-yellow-400 font-semibold text-sm">Score: {player.highestScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COINS SECTION */}
      <div
        id="live-bg-section"
        className="relative z-40 flex flex-col items-center justify-center bg-cover bg-center transition-all duration-800 min-h-[80vh] md:min-h-[90vh] py-20"
        style={{ backgroundImage: "url('/bridge-bg.png')" }}
      >
        <h2 className="text-4xl font-bold text-white drop-shadow-lg mt-30 mb-15">Rush Coins </h2>
        <div className="flex flex-col md:flex-row gap-10 px-6 md:px-20 w-full justify-center items-stretch">

          {/* Card 1 */}
          <div className="scroll-wrapper flex-1 max-w-[300px] min-h-[380px]">
            <div className="group coin-card bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col items-center justify-between shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 will-change-transform h-full">
              <img src="/coin.png" className="w-28 h-28 mb-4 mt-5 animate-bounce drop-shadow-[0_0_15px_gold]" />
              <h3 className="text-xl font-bold mb-5 text-center">Earn Coins</h3>
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-inner w-full flex-1">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02]">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Earn 10 coins per correct answer
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-75">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Build streaks to earn faster
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-100">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    More accuracy = more coins
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="scroll-wrapper flex-1 max-w-[300px] min-h-[380px]">
            <div className="group coin-card bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col items-center justify-between shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 will-change-transform h-full">
              <img src="/treasure.png" className="w-28 h-28 mb-4 mt-5 animate-bounce drop-shadow-[0_0_15px_orange]" />
              <h3 className="text-xl font-bold mb-5 text-center">Skip Puzzle</h3>
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-inner w-full flex-1">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02]">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Skip difficult puzzles instantly
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-75">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Costs 20 coins per skip
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-100">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Maintain your combo streak
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="scroll-wrapper flex-1 max-w-[300px] min-h-[380px]">
            <div className="group coin-card bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col items-center justify-between shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 will-change-transform h-full">
              <img src="/bag2.png" className="w-32 h-32 mb-1 mt-5 animate-bounce drop-shadow-[0_0_15px_yellow]" />
              <h3 className="text-xl font-bold mb-5 text-center">Continue Game</h3>
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-inner w-full flex-1">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02]">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Continue after game over
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-75">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Costs 30 coins to revive
                  </li>
                  <li className="flex items-start gap-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-[1.02] delay-100">
                    <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                    Keep your score and progress
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

     <div className="relative z-50 bg-purple-900 w-full flex flex-col md:flex-row items-start justify-between py-20 px-10 gap-10">

  {/* Left Section */}
  <div className="flex-1 flex flex-col justify-start md:pl-10">
    
    {/* Centered Title with glow, subtle pulse, and transparent underline */}
    <h2 className="relative text-3xl font-bold text-white mb-15 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] after:content-[''] after:block after:w-20 after:h-1 after:mx-auto after:mt-2 after:bg-white/70 after:rounded-full">
      Time Challenge
    </h2>

    {/* Cards Container */}
    <div className="flex flex-col gap-9 items-center">

      <style>
        {`
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 0px rgba(255,255,255,0.2); }
            50% { box-shadow: 0 0 15px rgba(255,255,255,0.35); }
          }
          @keyframes videoGlowPulse {
            0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
            50% { box-shadow: 0 0 25px rgba(255,255,255,0.4); }
          }
          .animate-glow1 { animation: glowPulse 3s infinite 0s; }
          .animate-glow2 { animation: glowPulse 3s infinite 1s; }
          .animate-glow3 { animation: glowPulse 3s infinite 2s; }
          .animate-videoGlow { animation: videoGlowPulse 3s infinite; }
        `}
      </style>

      {/* Card 1 */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-glow1">
        <div className="flex items-center gap-3 text-white/90">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <p>Each level starts with a fixed time limit</p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-glow2">
        <div className="flex items-center gap-3 text-white/90">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <p>
            Time decreases by <span className="text-yellow-300 font-bold">5 seconds</span> every level
          </p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-glow3">
        <div className="flex items-center gap-3 text-white/90">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <p>Run out of time and the game ends — think fast!</p>
        </div>
      </div>

      {/* Card 4 - Encouraging Button Card */}
      <div className="w-full max-w-xl flex justify-center">
        <Link href="/login">
          <button className="relative flex items-center justify-center border border-white/20 bg-white/5 text-white font-bold px-20 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300 mt-10">
            Race the Clock
            <span className="absolute inset-0 rounded-full opacity-20 bg-white/20 animate-ping"></span>
          </button>
        </Link>
      </div>

    </div>
  </div>

  {/* Right Video */}
  <div className="flex-1 flex justify-center">
    <video
      src="/clock5.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="w-full max-w-[280px] md:max-w-[320px] rounded-2xl shadow-lg border-2 border-white/30 animate-videoGlow"
    />
  </div>

</div>

    </div>
  );
}