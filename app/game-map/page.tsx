"use client";

import Link from "next/link";
import { STAGES } from "../../lib/stages";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function GameMap() {
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [userId, setUserId] = useState<string>("guest");

  useEffect(() => {
  async function loadUserProgress() {
    try {
      const storedUserId = localStorage.getItem("userId") || "guest";
      setUserId(storedUserId);

      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (res.ok) {
        const currentStage = data.stats.currentStage || 1;

        // Generate completed stages from currentStage
        const completed = [];
        for (let i = 1; i < currentStage; i++) {
          completed.push(i);
        }

        setCompletedStages(completed);

        // Sync to localStorage (optional)
        localStorage.setItem("completedStages", JSON.stringify(completed));
      } else {
        // fallback to localStorage if API fails
        const savedStages = JSON.parse(localStorage.getItem("completedStages") || "[]");
        setCompletedStages(savedStages);
      }
    } catch (err) {
      console.log("Failed to load progress", err);
    }
  }

  loadUserProgress();
}, []);

  const currentStageId = STAGES.find(
    (stage) =>
      !completedStages.includes(stage.id) &&
      (stage.id === 1 || completedStages.includes(stage.id - 1))
  )?.id;

  const isUnlocked = (stageId: number) => {
    if (stageId === 1) return true;
    return completedStages.includes(stageId - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0)
      return `${mins} minute${mins > 1 ? "s" : ""} ${secs} second${secs !== 1 ? "s" : ""}`;
    if (mins > 0 && secs === 0) return `${mins} minute${mins > 1 ? "s" : ""}`;
    return `${secs} second${secs !== 1 ? "s" : ""}`;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos((prev) => ({
        x: prev.x + (e.clientX - prev.x) * 0.2,
        y: prev.y + (e.clientY - prev.y) * 0.2,
      }));
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .cursor-hover');
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  const arenaNames = [
    "Misty Lakehouse",
    "Sunset Canyon",
    "Garden of Time",
    "Lakeside Drift",
    "Gloomy Peaks",
    "Speedway Bridge",
    "Obsidian Circuit",
    "Bluewater Bay",
    "Icy Heights",
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start text-white px-6 overflow-hidden cursor-none">

      {/* Custom Banana Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: "translate(-20%, -20%)",
        }}
      >
        <div className={`relative transition-all duration-200 ${isHovering ? "scale-150" : "scale-100"}`}>
          <img
            src="/banana.png"
            alt="banana cursor"
            className="pointer-events-none select-none"
            style={{
              width: isHovering ? "55px" : "40px",
              height: "auto",
              transform: isHovering ? "rotate(25deg)" : "rotate(15deg)",
              transition: "all 0.2s ease",
            }}
          />
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-yellow-400 transition-all duration-200 ${
              isHovering ? "w-14 h-14 opacity-100" : "w-0 h-0 opacity-0"
            }`}
          ></div>
        </div>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img src="/map1.jpeg" alt="Map Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Grid wrapper */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-16 w-full max-w-6xl pb-20 mt-12">
        {STAGES.map((stage, index) => {
          const unlocked = isUnlocked(stage.id);
          const cleared = completedStages.includes(stage.id);
          const inProgress = stage.id === currentStageId;

          return (
            <div key={stage.id} className="relative cursor-hover">
              <Link
                href={unlocked ? `/play/${stage.id}` : "#"}
                className={`relative group p-6 rounded-3xl transition-transform duration-300 hover:scale-105 block border ${
                  unlocked
                    ? "bg-white/10 border-white/40 animate-twinkle shadow-[0_0_15px_4px_rgba(255,255,255,0.6)]"
                    : "bg-gray-500/30 opacity-50 cursor-not-allowed border-transparent"
                }`}
              >
                {cleared && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-md text-xs animate-twinkle">
                    CLEARED
                  </span>
                )}
                {inProgress && !cleared && (
                  <span className="absolute top-3 right-3 bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-md text-xs animate-twinkle">
                    IN PROGRESS
                  </span>
                )}

                <h2 className="text-2xl font-bold mb-1 text-center">RACE {stage.id}</h2>
                <div className="mx-auto w-15 h-[2.5px] bg-white/40 mb-4 rounded animate-underlineGlow"></div>
                <h3 className="text-lg text-center mb-3 italic text-yellow-200">{arenaNames[index]}</h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-inner">
                  <ul className="text-sm text-white text-left space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                      Puzzles: {stage.puzzles}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-1 rounded-full bg-white animate-pulse"></span>
                      Time: {formatTime(stage.time)}
                    </li>
                  </ul>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes twinkleGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2), 0 0 5px rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.6), 0 0 50px rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.9);
          }
        }
        .animate-twinkle { animation: twinkleGlow 2.5s infinite; }

        @keyframes underlineGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 10px rgba(255,255,255,0.5); }
        }
        .animate-underlineGlow { animation: underlineGlow 2.5s infinite; }
      `}</style>
    </div>
  );
}