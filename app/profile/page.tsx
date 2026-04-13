"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

type UserType = {
  username: string;
  email: string;
  stats?: {
    totalScore?: number;
    gamesPlayed?: number;
    highestScore?: number;
    correctAnswers?: number;
    coins?: number;
    currentStage?: number;
  };
};

type LeaderboardEntry = {
  _id: string;
  username: string;
  highestScore: number;
  rank?: number;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [u, l] = await Promise.all([
  fetch("/api/auth/me"),
  fetch("/api/leaderboard/top"),
]);

if (!u.ok) {
  router.push("/login");
  return;
}

const userData = await u.json();
      const leaderData = await l.json();

      let rank = 1;
      const ranked = leaderData.map((p: any, i: number) => {
        if (i === 0) return { ...p, rank: 1 };
        if (p.highestScore === leaderData[i - 1].highestScore)
          return { ...p, rank };
        rank++;
        return { ...p, rank };
      });

      setUser(userData);
      setLeaders(ranked);
      setLoading(false);
    }

    load();
  }, []);

  const getAvatar = (u: string) =>
    `https://api.dicebear.com/7.x/pixel-art/png?seed=${u}`;

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#01061C] overflow-hidden">
      
      <div className="relative w-24 h-24 rounded-full border-4 border-purple-400/30 flex items-center justify-center animate-spin-slow">
        <div className="absolute w-20 h-20 border-4 border-t-purple-400 border-purple-400/40 rounded-full animate-spin-neon"></div>
        <div className="absolute w-16 h-16 border-2 border-t-purple-300 border-purple-300/50 rounded-full animate-pulse-neon"></div>
      </div>

    </div>
  );
}

if (!user) return null;

  const {
    totalScore = 0,
    gamesPlayed = 0,
    highestScore = 0,
    correctAnswers = 0,
    coins = 0,
    currentStage = 1,
  } = user.stats || {};

  const level = Math.min(currentStage, 9);
  const levelPercent = (level / 9) * 100;

  const myRank =
    leaders.find((p) => p.username === user.username)?.rank ?? "—";

  // ⭐ RANK RING SYSTEM
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

  // 🏆 RANK NAME
  const getRankName = (score: number) => {
    if (score <= 50) return "Beginner";
    if (score <= 100) return "Rising";
    if (score <= 200) return "Advanced";
    if (score <= 300) return "Elite";
    return "Supreme";
  };

  // 🏆 BADGE PATHS (UPDATE THESE)
  const badges = {
    games5: "/badges/5.png",
    coinCollector: "/badges/coincollector.png",
    correct50: "/badges/50.png",
    rank: {
      Beginner: "/badges/beginner.png",
      Rising: "/badges/rising.png",
      Advanced: "/badges/advanced.png",
      Elite: "/badges/elite.png",
      Supreme: "/badges/supreme.png",
    },
  };

  //  BADGE LOGIC
  const unlockedBadges = [
    {
      name: "Stage 5 Reached",
      unlocked: currentStage >= 5,
      img: badges.games5,
    },
    {
      name: "Coin Collector",
      unlocked: coins > 100,
      img: badges.coinCollector,
    },
    {
      name: "50 Correct Answers",
      unlocked: correctAnswers > 50,
      img: badges.correct50,
    },
  ];

  const currentRankName = getRankName(highestScore);
  const rankBadge =
    badges.rank[currentRankName as keyof typeof badges.rank];

  return (
    <div
  className="min-h-screen text-white bg-cover bg-center"
  style={{ backgroundImage: "url('/profile.png')" }}
>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-14">
          <h1 className="w-full text-center text-4xl font-extrabold text-purple-300 tracking-widest relative inline-block mb-5">
            PLAYER PROFILE
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-50 h-[2px] bg-gradient-to-r from-transparent via-purple-400/80 to-transparent blur-[0.4px] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </h1>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-4 gap-6">

          {/* PROFILE CARD */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">

            <img
              src={getAvatar(user.username)}
              className={`w-24 h-24 mx-auto rounded-full ring-4 ${getRankRing(highestScore)} ring-offset-2 ring-offset-black mt-3`}
            />

            <h2 className="text-center mt-4 text-xl font-bold text-purple-300">
              {user.username}
            </h2>

            <p className="text-center text-gray-400 text-sm">
              {user.email}
            </p>

            <div className="mt-6">
              <p className="text-purple-300 font-bold">
                Level {level} / 9
              </p>

              <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  style={{ width: `${levelPercent}%` }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 via-purple-600 via-pink-500 to-purple-900"
                />
                </div>

              <p className="text-xs text-gray-400 mt-1">
                Stage Progress
              </p>
            </div>

            <div className="my-6 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

            <p className="text-center text-purple-300 font-bold tracking-widest mb-3">
              RUSHER POSITION
            </p>

            <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 text-center backdrop-blur-md">
              <p className="text-gray-400 text-xs mb-1">Current Rank</p>
              <span className="text-xl font-bold text-purple-300">
                #{myRank}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse"></span>
              <span>{getRankName(highestScore)}</span>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-6 ">

            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/30  transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">
              <p className="text-purple-300 mb-5">Highest Score</p>
              <div className="text-3xl font-bold">{highestScore}</div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/30 transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">
              <p className="text-purple-300 mb-5">Correct Answers</p>
              <div className="text-3xl font-bold">{correctAnswers}</div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/30 transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">
              <p className="text-purple-300 mb-5">Games Played</p>
              <div className="text-3xl font-bold">{gamesPlayed}</div>
            </div>

            {/* COIN BALANCE CARD */}
<div className="md:col-span-2 bg-gradient-to-br from-yellow-400/10 via-purple-500/10 to-black/30 p-6 rounded-3xl border border-yellow-400/20 flex flex-col justify-center items-center transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">

  {/* ICON ANIMATION (inside same file) */}
  <style jsx>{`
    @keyframes coinGlowBounce {
      0%, 100% {
        transform: translateY(0) scale(1);
        filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.6));
      }
      50% {
        transform: translateY(-10px) scale(1.08);
        filter: drop-shadow(0 0 25px rgba(250, 204, 21, 1));
      }
    }

    .coin-animate {
      animation: coinGlowBounce 1.6s ease-in-out infinite;
    }
      
    
  `}</style>

  {/* ICON FROM PUBLIC FOLDER */}
  <div className="mb-3 flex items-center justify-center">
    <img
      src="/coin.png"
      className="coin-animate"
      style={{
        width: "90px",   
        height: "90px"   
      }}
      alt="coin icon"
    />
  </div>

  {/* TITLE */}
  <p className="text-purple-300 text-lg font-bold ">
    Coin Balance
  </p>

  {/* VALUE */}
  <p className="text-4xl font-extrabold text-yellow-300 mt-2">
    {coins}
  </p>

  {/* SUBTEXT */}
  <p className="text-xs text-gray-400 mt-2">
    Earn coins by completing stages & winning games
  </p>

</div>

            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/30 text-smtransition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 backdrop-blur-md transition-transform duration-200 ease-out hover:scale-95">
                  <p className="text-gray-400">Total Score</p>
                  <p className="text-xl font-bold text-purple-300">{totalScore}</p>
                </div>
                <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 backdrop-blur-md transition-transform duration-200 ease-out hover:scale-95">
                  <p className="text-gray-400">Current Stage</p>
                  <p className="text-xl font-bold text-purple-300">{currentStage}</p>
                </div>
                <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 backdrop-blur-md transition-transform duration-200 ease-out hover:scale-95">
                  <p className="text-gray-400">Leaderboard Rank</p>
                  <p className="text-xl font-bold text-yellow-300">#{myRank}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        
{/* 🏆 ACHIEVEMENT WALL */}
<div className="mt-16" >

  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 transition-transform duration-200 shadow-[0_0_14px_rgba(168,85,247,0.45),0_0_30px_rgba(168,85,247,0.18)] hover:scale-105">

    {/* TITLE */}
    <h2 className="text-center text-3xl font-extrabold text-purple-300 tracking-widest mb-15 relative ">
      TROPHY WALL
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-40 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.6)] " />
    </h2>

    {/* BADGES */}
    <div className="flex flex-wrap justify-center gap-8">

      {unlockedBadges.map((badge, i) => (
        <div
          key={i}
          className={`w-[260px] h-[340px] bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl
          flex flex-col items-center justify-center p-4 transition-all duration-300
          ${badge.unlocked ? "hover:scale-105" : "opacity-30 grayscale"}`}
        >

          <div className="flex-1 flex items-center justify-center">
            <img
              src={badge.img}
              className="w-[240px] h-[240px] object-contain
              drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            />
          </div>

          <div className="h-12 flex items-center justify-center">
            <p className="text-sm text-center mb-20 text-purple-200">
              {badge.name}
            </p>
          </div>

        </div>
      ))}

      {/* RANK BADGE */}
      <div className="w-[260px] h-[340px] bg-white/5 backdrop-blur-xl border border-yellow-400/20 rounded-2xl
        flex flex-col items-center justify-center p-4 transition-all duration-300 hover:scale-105">

        <div className="flex-1 flex items-center justify-center">
          <img
            src={rankBadge}
            className="w-[240px] h-[240px] object-contain
            drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]"
          />
        </div>

        <div className="h-12 flex items-center justify-center">
          <p className="text-sm text-center text-yellow-300 mb-20 font-bold">
            {currentRankName} Rank
          </p>
        </div>

      </div>

    </div>

  </div>
</div>

      </div>
    </div>
  );
}