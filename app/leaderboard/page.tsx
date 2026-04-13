"use client"

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type LeaderboardEntry = {
  _id: string;
  username: string;
  highestScore: number;
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [starsNear, setStarsNear] = useState<any[]>([]);
  const [starsMid, setStarsMid] = useState<any[]>([]);
  const [starsFar, setStarsFar] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/top");

        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();

        setLeaders(data.slice(0, 10));
      } catch (err) {
        setError("Failed to load leaderboard. Try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // 🌌 STAR SYSTEM
  useEffect(() => {
    setStarsFar(Array.from({ length: 120 }));
    setStarsMid(Array.from({ length: 140 }));
    setStarsNear(Array.from({ length: 160 }));
  }, []);

  const getAvatar = (username: string) =>
    `https://api.dicebear.com/7.x/pixel-art/png?seed=${username}`;

  let currentRank = 1;

  const rankedLeaders = leaders.map((player, index) => {
    if (index === 0) return { ...player, rank: 1 };

    if (player.highestScore === leaders[index - 1].highestScore) {
      return { ...player, rank: currentRank };
    }

    currentRank += 1;
    return { ...player, rank: currentRank };
  });

  const top3 = rankedLeaders.slice(0, 3);
  const rest = rankedLeaders.slice(3);

  // ⭐ PREMIUM RANK COLOR SYSTEM (ENHANCED GLOW)
  const getRankRing = (score: number) => {
    if (score <= 50)
      return "ring-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.6)]";
    if (score <= 100)
  return "ring-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]";
    if (score <= 200)
      return "ring-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.8)]";
    if (score <= 300)
      return "ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]";
    return "ring-yellow-300 shadow-[0_0_26px_rgba(255,215,0,0.95)]";
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-100 flex flex-col bg-[radial-gradient(circle_at_10%_10%,rgba(255,84,176,0.22),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(255,84,176,0.20),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(255,84,176,0.18),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(255,84,176,0.18),transparent_40%),linear-gradient(to_bottom_right,#000000,#3b0764,#312e81)]">

      {/* 🌫 NEBULA */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.30),transparent_60%)] animate-pulse opacity-80 pointer-events-none" />

      {/* 🌌 FAR STARS */}
      <div className="absolute inset-0 pointer-events-none">
        {starsFar.map((_, i) => (
          <div
            key={`far-${i}`}
            className="absolute w-[2px] h-[2px] bg-purple-300 rounded-full opacity-40 animate-[floatFar_18s_linear_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 🌌 MID STARS */}
      <div className="absolute inset-0 pointer-events-none">
        {starsMid.map((_, i) => (
          <div
            key={`mid-${i}`}
            className="absolute w-[3px] h-[3px] bg-purple-200 rounded-full opacity-70 animate-[floatMid_12s_linear_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 🌌 NEAR STARS */}
      <div className="absolute inset-0 pointer-events-none">
        {starsNear.map((_, i) => (
          <div
            key={`near-${i}`}
            className="absolute w-[4px] h-[4px] bg-white rounded-full shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-[floatNear_18s_linear_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center pt-0 pb-12 md:pb-16 relative z-10">

        <Navbar />


        <style jsx>{`
          @keyframes race {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(4px); }
            50% { transform: translateX(0px); }
            75% { transform: translateX(-4px); }
          }

          .animate-race {
            animation: race 5s ease-in-out infinite;
          }

          @keyframes floatFar {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(-30px, 20px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes floatMid {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(0px, -30px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes floatNear {
            0% { transform: translate(0px, 0px); }
            25% { transform: translate(20px, -40px); }
            50% { transform: translate(-50px, 20px); }
            75% { transform: translate(10px, 20px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes bananaBounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes bananaGlow {
            0%, 100% { filter: drop-shadow(0 0 0px #a855f7); }
            50% { filter: drop-shadow(0 0 14px #a855f7); }
          }

          .banana-animate {
            animation: bananaBounce 1.2s ease-in-out infinite,
                       bananaGlow 1.5s ease-in-out infinite;
          }

          @keyframes syncPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.75;
    box-shadow: 0 0 6px rgba(255,255,255,0.4);
  }
  50% {
    transform: scale(1.35);
    opacity: 1;
    box-shadow: 0 0 14px rgba(255,255,255,0.9);
  }
}

.sync-glow {
  animation: syncPulse 1.8s ease-in-out infinite;
}

@keyframes scanDown {
    0% {
      top: -30%;
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      top: 130%;
      opacity: 0;
    }
  }

  .leaderboard-card::before {
    content: "";
    position: absolute;
    left: 0;

    width: 100%;
    height: 160px;

    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.28),
      rgba(255, 255, 255, 0.08),
      transparent
    );

    animation: scanDown 8s linear infinite;

    pointer-events: none;
    filter: blur(1.2px);
    z-index: 10;
  }

        `}</style>

        {loading ? (
  <div className="w-full flex items-center justify-center py-20">
    <div className="relative w-24 h-24 rounded-full border-4 border-purple-400/30 flex items-center justify-center animate-spin-slow">
      <div className="absolute w-20 h-20 border-4 border-t-purple-400 border-purple-400/40 rounded-full animate-spin-neon"></div>
      <div className="absolute w-16 h-16 border-2 border-t-purple-300 border-purple-300/50 rounded-full animate-pulse-neon"></div>
    </div>
  </div>
) : error ? (
  <p className="text-red-400 text-lg mb-6">{error}</p>
) : (
  <div className="w-full max-w-xl bg-purple-950/40 backdrop-blur-md rounded-3xl shadow-4xl border border-white/10 p-6 mt-10 md:p-8 shadow-[0_0_25px_rgba(255,255,255,0.12)] relative overflow-hidden leaderboard-card">

  <h1 className="text-4xl md:text-4xl font-extrabold text-purple-300 mt-5 mb-10 text-center animate-race tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] relative">
  TOP RUSHERS

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-40 h-[2px] bg-gradient-to-r from-transparent via-purple-300/60 to-transparent blur-[0.3px]" />
</h1>
            {/* TOP 3 */}
           <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-purple-800/40 rounded-xl p-6 md:p-8 min-h-[220px] mb-8 mt-4 flex justify-center items-end gap-10 w-[85%] mx-auto border border-purple-600/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]">

              {top3[1] && (
                <div className="flex flex-col items-center">
                  <img
                    src={getAvatar(top3[1].username)}
                    className={`w-16 h-16 rounded-full border-1 ring-2 ${getRankRing(top3[1].highestScore)} ring-offset-2 ring-offset-purple-950`}
                  />
                  <p className="text-sm font-bold mt-2 text-purple-200">{top3[1].username}</p>
                  <p className="text-purple-300 font-bold">{top3[1].highestScore}</p>
                </div>
              )}

              {top3[0] && (
                <div className="flex flex-col items-center scale-110">
                  <div className="text-3xl mb-3 banana-animate">🍌</div>
                  <img
                    src={getAvatar(top3[0].username)}
                    className={`w-20 h-20 rounded-full border-1 ring-4 ${getRankRing(top3[0].highestScore)} ring-offset-2 ring-offset-purple-950 top1-glow`}
                  />
                  <p className="font-bold mt-2 text-purple-100">{top3[0].username}</p>
                  <p className="text-purple-300 font-extrabold">{top3[0].highestScore}</p>
                </div>
              )}

              {top3[2] && (
                <div className="flex flex-col items-center">
                  <img
                    src={getAvatar(top3[2].username)}
                    className={`w-16 h-16 rounded-full border-1 ring-2 ${getRankRing(top3[2].highestScore)} ring-offset-2 ring-offset-purple-950`}
                  />
                  <p className="text-sm font-bold mt-2 text-purple-200">{top3[2].username}</p>
                  <p className="text-purple-300 font-bold">{top3[2].highestScore}</p>
                </div>
              )}
            </div>

            {/* REST */}
            <div className="space-y-3">
              {rest.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-indigo-900/40 px-4 py-3 rounded-xl shadow-sm border border-purple-700/30 hover:shadow-purple-500/20 hover:scale-[1.02] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-purple-300 w-6">
                      {player.rank}
                    </span>

                    <img
                      src={getAvatar(player.username)}
                      className={`w-10 h-10 rounded-full border-1 ring-2 ${getRankRing(player.highestScore)} ring-offset-2 ring-offset-purple-950 shadow-md`}
                    />

                    <span className="font-semibold text-purple-100">
                      {player.username}
                    </span>
                  </div>

                  <span className="font-bold text-purple-300">
                    {player.highestScore}
                  </span>
                </div>
              ))}
            </div>

           {/* 🏆 RANK LEGEND BOX */}
<div className="mt-8 p-4 rounded-xl border border-purple-700/40 bg-purple-900/20 text-xs text-purple-200">
  <p className="font-bold text-purple-100 mb-5">Rank System</p>

  <div className="flex flex-wrap items-center gap-10">

  <span className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:text-white cursor-default">
    <span className="w-3 h-3 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.8)] sync-glow"></span>
    Beginner
  </span>

  <span className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:text-white cursor-default">
    <span className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.9)] sync-glow"></span>
    Rising
  </span>

  <span className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:text-white cursor-default">
    <span className="w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.85)] sync-glow"></span>
    Advanced
  </span>

  <span className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:text-white cursor-default">
    <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)] sync-glow"></span>
    Elite
  </span>

  <span className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:text-white cursor-default">
    <span className="w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,1)] sync-glow"></span>
    Supreme
  </span>

</div>
  
</div>

          </div>
        )}
      </div>
    </div>
  );
}