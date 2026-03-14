"use client";

import { useState, useEffect, useRef } from "react";
import { getPuzzle } from "../lib/bananaAPI";
import TimerBar from "./TimerBar";

export default function GameBoard() {
  const START_TIME = 30;
  const MIN_TIME = 5;
  const TIME_DECREMENT = 5;
  const BASE_SCORE = 10;

  const [puzzle, setPuzzle] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0); // total coins
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(START_TIME);

  const timerRef = useRef<any>(null);

  // Load puzzle
  async function loadPuzzle(isFirst = false) {
    const data = await getPuzzle();
    setPuzzle(data);
    setFeedback("");

    const newTimeLimit = isFirst
      ? START_TIME
      : Math.max(MIN_TIME, currentTimeLimit - TIME_DECREMENT);

    setCurrentTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
  }

  useEffect(() => {
    loadPuzzle(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      setFeedback("⏰ Time's Up! Game Over");
      setCombo(0);
      return;
    }

    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 0.1), 100);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameOver]);

  // Submit answer
  function submit() {
    if (!puzzle || gameOver) return;

    if (parseInt(answer) === puzzle.solution) {
      setCombo((prev) => prev + 1);
      setScore(score + BASE_SCORE * (1 + combo * 0.5));
      setCoins(coins + 10); // ✅ add 10 coins
      setFeedback(`✅ Correct! +10 Coins! Combo x${combo + 1}`);

      setTimeout(() => loadPuzzle(), 1200);
    } else {
      setFeedback("❌ Wrong! Game Over");
      setCombo(0);
      setGameOver(true); // ❌ wrong = game over
    }

    setAnswer("");
  }

  // Restart game
  function restartGame() {
    setScore(0);
    setCoins(0);
    setCombo(0);
    setCurrentTimeLimit(START_TIME);
    setTimeLeft(START_TIME);
    setGameOver(false);
    loadPuzzle(true);
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      {/* Score + Coins + Combo */}
      <div className="mb-4 flex items-center gap-6">
        <div className="bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg w-36 text-center animate-pulse">
          <h2 className="text-lg font-bold">Score: {score.toFixed(0)}</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-3xl animate-bounce-glow" style={{
            textShadow: "0 0 5px #fff, 0 0 10px #ffeb3b, 0 0 20px #ffeb3b, 0 0 30px #ffeb3b",
          }}>🪙</span>
          <span className="text-white font-bold text-xl animate-bounce-glow" style={{ animationDelay: "150ms" }}>
            x{coins}
          </span>
        </div>
      </div>

      {/* Puzzle Card */}
      <div className="bg-black/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-md transition-transform transform hover:scale-105 duration-300">
        {puzzle && (
          <img
            src={puzzle.question}
            alt="Puzzle"
            className="w-96 h-auto rounded-xl shadow-lg mb-4"
          />
        )}

        {/* Timer */}
        {!gameOver && (
          <div className="w-full mb-4">
            <div className="flex justify-between mb-1 text-white font-bold">
              <span>Time Left:</span>
              <span>{timeLeft.toFixed(1)}s</span>
            </div>
            <TimerBar time={timeLeft} maxTime={currentTimeLimit} />
          </div>
        )}

        {/* Input */}
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className="w-full px-4 py-3 mb-4 rounded-xl border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-white font-semibold bg-black/50 placeholder:text-gray-300 transition duration-200"
          disabled={gameOver}
        />

        {/* Buttons */}
        {!gameOver ? (
          <button
            onClick={submit}
            className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 active:scale-95 transition-transform duration-150 shadow-lg"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="w-full py-3 bg-red-500 text-white font-bold hover:bg-red-600 rounded-xl active:scale-95 transition-transform duration-150 shadow-lg"
          >
            Restart Game
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <p className={`mt-3 font-semibold ${feedback.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </p>
        )}
      </div>

      {/* Coin bounce animation */}
      <style jsx>{`
        @keyframes bounce-glow {
          0% { transform: translateY(0); opacity: 0; }
          30% { transform: translateY(-15px); opacity: 1; }
          60% { transform: translateY(-5px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-glow {
          animation: bounce-glow 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
}