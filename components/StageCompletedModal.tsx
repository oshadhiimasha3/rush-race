"use client";

export default function StageCompletedModal({
  score,
  puzzlesSolved,
  stageId,
}: {
  score: number;
  puzzlesSolved: number;
  stageId: number;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {/* Outer glowing rectangle */}
      <div className="relative w-[90%] max-w-md px-6 py-6 rounded-3xl stagecomplete-glow-border">
        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center shadow-2xl flex flex-col items-center gap-3">
          {/* Title with white twinkling glow */}
          <div className="relative w-full">
            <h2 className="text-2xl font-bold stagecomplete-glow-text truncate">
              Race {stageId} Completed
            </h2>
            {/* Simple underline with small space above */}
            <span className="stagecomplete-underline"></span>
          </div>

          {/* Score & Puzzles Solved */}
          <div className="flex flex-col gap-5 w-full mt-3">
            <div className="score-card">
              <p className="text-md font-semibold">Score: {score}</p>
            </div>
            <div className="score-card">
              <p className="text-md font-semibold">Puzzles Solved: {puzzlesSolved}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Outer card yellow glow */
        .stagecomplete-glow-border {
          box-shadow:
            0 0 15px rgba(255, 215, 0, 0.8),
            0 0 30px rgba(255, 215, 0, 0.6),
            0 0 45px rgba(255, 215, 0, 0.4);
        }

        /* White text glow without blocky effect */
        .stagecomplete-glow-text {
          color: white;
          text-shadow:
            0 0 2px rgba(255, 255, 255, 0.8),
            0 0 4px rgba(255, 255, 255, 0.6),
            0 0 6px rgba(255, 255, 255, 0.4);
          animation: twinkle 1.5s ease-in-out infinite alternate;
        }

        /* Simple underline with small spacing */
        .stagecomplete-underline {
          display: block;
          height: 3px;
          width: 20%;
          background: rgba(255, 255, 255, 0.35);
          margin: 6px auto 0 auto;
          border-radius: 2px;
        }

        /* Score & puzzle cards permanent white glow + pop hover */
        .score-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-blur: 8px;
          padding: 0.75rem;
          border-radius: 0.75rem;
          box-shadow:
            0 0 10px rgba(255, 255, 255, 0.4),
            0 0 20px rgba(255, 255, 255, 0.2);
          transition: all 0.25s ease;
          cursor: default;
        }

        .score-card:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 15px rgba(255, 255, 255, 0.6),
            0 0 25px rgba(255, 255, 255, 0.4);
        }

        @keyframes twinkle {
          0% {
            text-shadow:
              0 0 1px rgba(255, 255, 255, 0.4),
              0 0 2px rgba(255, 255, 255, 0.3),
              0 0 3px rgba(255, 255, 255, 0.2);
          }
          50% {
            text-shadow:
              0 0 3px rgba(255, 255, 255, 0.8),
              0 0 6px rgba(255, 255, 255, 0.6),
              0 0 9px rgba(255, 255, 255, 0.4);
          }
          100% {
            text-shadow:
              0 0 2px rgba(255, 255, 255, 0.6),
              0 0 4px rgba(255, 255, 255, 0.4),
              0 0 6px rgba(255, 255, 255, 0.2);
          }
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}