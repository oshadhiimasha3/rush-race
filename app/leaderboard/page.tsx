"use client"

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // import Footer

type LeaderboardEntry = {
  _id: string;
  username: string;
  highestScore: number;
};

export default function Leaderboard() {
  // this holds all players
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  // loading state while fetching
  const [loading, setLoading] = useState(true);

  // error if something breaks
  const [error, setError] = useState("");

  useEffect(() => {
    // this function gets leaderboard data from backend
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/top");

        // if api fails throw error
        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();

        // only keep top 10 players
        setLeaders(data.slice(0, 10));
      } catch (err) {
        setError("Failed to load leaderboard. Try again later.");
        console.error(err);
      } finally {
        // stop loading no matter what
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // this gives pixel style avatars 
  const getAvatar = (username: string) =>
    `https://api.dicebear.com/7.x/pixel-art/png?seed=${username}`;

  // RANKING  
  let currentRank = 1;

  const rankedLeaders = leaders.map((player, index) => {
    // first player always rank 1
    if (index === 0) {
      return { ...player, rank: 1 };
    }

    // if same score → same rank
    if (player.highestScore === leaders[index - 1].highestScore) {
      return { ...player, rank: currentRank };
    }

    // if score different → just increase rank by 1
    currentRank += 1;

    return { ...player, rank: currentRank };
  });

  // top 3 players
  const top3 = rankedLeaders.slice(0, 3);

  // rest starts from rank 4+
  const rest = rankedLeaders.slice(3);

  return (
    // top-level container with flex-col so Footer can stick to bottom
    <div className="min-h-screen bg-gradient-to-br from-brown-100 to-yellow-200 text-gray-900 flex flex-col">
      
      {/* Main content grows to push Footer down */}
      <div className="flex-1 flex flex-col items-center pt-0">
        
        {/* Navbar at the top */}
        <Navbar />

        {/* title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-600 mt-8 mb-10 text-center animate-race">
          TOP RUSHERS
        </h1>

        {/* animations */}
        <style jsx>{`
          /* small shake for title */
          @keyframes race {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(4px); }
            50% { transform: translateX(0px); }
            75% { transform: translateX(-4px); }
          }

          .animate-race {
            animation: race 2s ease-in-out infinite;
          }

          /* banana bounce */
          @keyframes bananaBounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          /* banana glow */
          @keyframes bananaGlow {
            0%, 100% { filter: drop-shadow(0 0 0px #facc15); }
            50% { filter: drop-shadow(0 0 10px #facc15); }
          }

          .banana-animate {
            animation: bananaBounce 1.2s ease-in-out infinite,
                       bananaGlow 1.5s ease-in-out infinite;
          }
        `}</style>

        {loading ? (
          // show loading text
          <p className="text-gray-700 text-lg mb-6">Loading...</p>
        ) : error ? (
          // show error if something breaks
          <p className="text-red-500 text-lg mb-6">{error}</p>
        ) : (
          // main leaderboard box (everything inside this)
          <div className="w-full max-w-xl bg-yellow-50/70 backdrop-blur-md rounded-3xl shadow-xl border border-yellow-200 p-6 md:p-8">

            {/* TOP 3 rounded box */}
            <div className="bg-gradient-to-r from-yellow-200/60 to-orange-300/60 rounded-xl p-4 mb-8 mt-4 flex justify-center items-end gap-6 w-[85%] mx-auto">
              
              {/* 2nd place */}
              {top3[1] && (
                <div className="flex flex-col items-center">
                  <img src={getAvatar(top3[1].username)} className="w-16 h-16 rounded-full border-4 border-yellow-300 shadow"/>
                  <p className="text-sm font-bold mt-2">{top3[1].username}</p>
                  <p className="text-yellow-700 font-bold">{top3[1].highestScore}</p>
                </div>
              )}

              {/* 1st place */}
              {top3[0] && (
                <div className="flex flex-col items-center scale-110">
                  
                  {/* animated banana */}
                  <div className="text-3xl mb-1 banana-animate">🍌</div>

                  <img src={getAvatar(top3[0].username)} className="w-20 h-20 rounded-full border-4 border-yellow-500 shadow-lg"/>
                  <p className="font-bold mt-2">{top3[0].username}</p>
                  <p className="text-yellow-600 font-extrabold">{top3[0].highestScore}</p>
                </div>
              )}

              {/* 3rd place */}
              {top3[2] && (
                <div className="flex flex-col items-center">
                  <img src={getAvatar(top3[2].username)} className="w-16 h-16 rounded-full border-4 border-yellow-200 shadow"/>
                  <p className="text-sm font-bold mt-2">{top3[2].username}</p>
                  <p className="text-yellow-700 font-bold">{top3[2].highestScore}</p>
                </div>
              )}
            </div>

            {/* REST (rank 4 → 10) */}
            <div className="space-y-3">
              {rest.map((player) => {
                return (
                  <div
                    key={player._id}
                    className="flex items-center justify-between bg-gradient-to-r from-yellow-200/70 to-yellow-300/70 px-4 py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition"
                  >
                    <div className="flex items-center gap-3">
                      
                      {/* this rank is now correct even if scores are same */}
                      <span className="font-bold text-yellow-700 w-6">
                        {player.rank}
                      </span>

                      {/* avatar */}
                      <img
                        src={getAvatar(player.username)}
                        className="w-10 h-10 rounded-full border-2 border-yellow-500 shadow-sm"
                      />

                      {/* username */}
                      <span className="font-semibold">
                        {player.username}
                      </span>
                    </div>

                    {/* score */}
                    <span className="font-bold text-yellow-700">
                      {player.highestScore}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}