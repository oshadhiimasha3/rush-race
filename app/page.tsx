"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/top");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaders(data.slice(0, 10));
      } catch (err) {
        setError("Failed to load leaderboard. Try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
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

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden">

      {/* VIDEO */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-[120vh] object-cover z-0">
        <source src="/bg-game.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 h-[120vh] bg-black/20 z-0" />

      <Navbar />

      {/* HERO */}
      <div className="relative z-10 flex flex-col items-center text-center mt-24 px-6">
        <h1 className="text-7xl font-extrabold mb-6 drop-shadow-[0_0_25px_rgba(255,255,0,1)]">
          🍌 RUSH RACE
        </h1>
        <p className="text-xl max-w-2xl mb-8">
          Solve puzzles fast, earn points, and dominate the leaderboard.
        </p>
      </div>

      {/* CARDS + BUTTON */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-center gap-8 mt-10 px-6 md:px-20 mb-20">

        {/* INSTRUCTIONS CARD */}
        <div className="flex-1 max-w-[460px] h-[300px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg hover:scale-105 transition">
          <h3 className="text-xl font-bold mb-2 text-center">Game Flow</h3>
          {/* Transparent underline */}
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

        {/* PLAY NOW BUTTON */}
        <div className="flex items-center justify-center md:mx-20">
          <Link href="/login">
            <button className="relative flex items-center justify-center border border-white/20 bg-white/5 text-white font-bold px-12 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300">
              Play Now &rarr;
              <span className="absolute inset-0 rounded-full opacity-20 bg-white/20 animate-ping"></span>
            </button>
          </Link>
        </div>
{/* LEADERBOARD CARD */}
<div className="flex-1 max-w-[500px] h-[300px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg transition">
  <h3 className="text-xl font-bold mb-2 text-center">Top Rushers</h3>
  {/* Transparent underline */}
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
          {/* Numeric bullet outside the avatar */}
          <span className="text-sm font-bold w-4 text-right">{index + 1}.</span>

          {/* Profile picture */}
          <img
            src={getAvatar(player.username)}
            className="w-10 h-10 rounded-full border-2 border-yellow-300"
          />

          {/* Username and Score */}
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

      <div className="relative z-10 mt-auto">
        <Footer />
      </div>

    </div>
  );
}