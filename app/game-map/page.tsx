"use client";

import Link from "next/link";
import { STAGES } from "../../lib/stages";
import { useState, useEffect } from "react";

export default function GameMap() {
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  // load completed stages from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("completedStages") || "[]");
    setCompletedStages(saved);
  }, []);

  // unlock logic
  const isUnlocked = (stageId: number) => {
    if (stageId === 1) return true;
    return completedStages.includes(stageId - 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-900 text-white px-6">
      <h1 className="text-4xl font-bold mb-10">🍌 Banana Game Map</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {STAGES.map((stage) => {
          const unlocked = isUnlocked(stage.id);

          return (
            <div
              key={stage.id}
              className={`p-6 rounded-2xl shadow-xl text-center transition ${
                unlocked
                  ? "bg-yellow-400 text-black hover:scale-105"
                  : "bg-gray-500 opacity-50"
              }`}
            >
              <h2 className="text-xl font-bold">Stage {stage.id}</h2>
              <p>{stage.puzzles} puzzles</p>
              <p>{stage.time}s timer</p>

              {unlocked ? (
                <Link href={`/play/${stage.id}`}>
                  <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg">
                    Play
                  </button>
                </Link>
              ) : (
                <p className="mt-3">🔒 Locked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}