"use client";

import { useRouter } from "next/navigation";

export default function PauseModal({
  setPaused,
}: {
  setPaused: (val: boolean) => void;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative w-[550px] px-6 py-6 rounded-3xl pause-glow-border">
        <div className="bg-white/10 backdrop-blur-lg px-12 py-8 rounded-3xl flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold pause-glow-text">Race Paused</h2>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl flex w-[400px] h-[120px]">
            {/* Left */}
            <div className="flex-1 flex justify-start items-center px-4">
              <button
                onClick={() => router.push("/game-map")}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <img
                  src="/mapicon.png"
                  alt="Map"
                  className="w-30 h-48 object-contain pause-icon-glow"
                />
              </button>
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center items-center">
              <button
                onClick={() => setPaused(false)}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <img
                  src="/resume2.png"
                  alt="Resume"
                  className="w-17 h-17 object-contain pause-icon-glow"
                />
              </button>
            </div>

            {/* Right */}
            <div className="flex-1 flex justify-end items-center px-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <img
                  src="/home.png"
                  alt="Home"
                  className="w-20 h-20 object-contain pause-icon-glow"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pause-glow-border {
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.9),
            0 0 30px rgba(255, 255, 255, 0.7),
            0 0 45px rgba(255, 255, 255, 0.5);
        }
        .pause-glow-text {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8),
            0 0 16px rgba(255, 255, 255, 0.6),
            0 0 24px rgba(255, 255, 255, 0.4);
        }
        @keyframes pauseIconTwinkle {
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
        .pause-icon-glow {
          animation: pauseIconTwinkle 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}