"use client";

import { useRouter } from "next/navigation";

export default function GameOverModal({
  score,
  puzzlesSolved,
  coins,
  restartGame,
}: {
  score: number;
  puzzlesSolved: number;
  coins: number;
  restartGame: () => void;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative w-[90%] max-w-md px-6 py-6 rounded-3xl gameover-glow-border">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center shadow-2xl flex flex-col items-center gap-4">
          <h2 className="text-4xl font-bold mb-4 text-white gameover-glow-text">
            Race Over
          </h2>

          {/* Keep the gap between Score and Solved */}
          <div className="flex flex-col gap-5 w-full mb-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-200">
              <p className="text-lg font-semibold">Score: {score}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-200">
              <p className="text-lg font-semibold">Solved: {puzzlesSolved}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-200">
              <p className="text-lg font-semibold">Coins: {coins}</p>
            </div>
          </div>

          {/* Retry costs 30 coins */}
          <p className="text-sm text-white/60 -mb-2 mt-3">Retry costs 30 coins</p>

          <div className="flex items-center justify-center gap-8 -mt-1">
            <img
              src="/retry.png"
              alt="Retry"
              className="cursor-pointer gameover-icon-glow w-20 h-40 hover:scale-110 transition-transform duration-200"
              onClick={restartGame}
            />
            <img
              src="/mapicon.png"
              alt="Map"
              className="cursor-pointer gameover-icon-glow w-25 h-40 hover:scale-110 transition-transform duration-200"
              onClick={() => router.push("/game-map")}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .gameover-glow-border {
          box-shadow: 0 0 15px rgba(157, 4, 4, 0.9),
            0 0 30px rgba(82, 3, 3, 0.7),
            0 0 45px rgba(60, 5, 5, 0.5);
        }
        .gameover-glow-text {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8),
            0 0 16px rgba(255, 255, 255, 0.6),
            0 0 24px rgba(255, 255, 255, 0.4);
        }
        @keyframes gameoverIconTwinkle {
          0%,
          100% {
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))
              drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))
              drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
          }
        }
        .gameover-icon-glow {
          animation: gameoverIconTwinkle 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}