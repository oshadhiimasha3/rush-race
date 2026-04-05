"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPuzzle } from "../lib/bananaAPI";
import TimerBar from "./TimerBar";
import { useSound } from "../context/SoundContext";
import { Stage } from "../lib/stages";

export default function GameBoard({
  userId,
  stageConfig,
}: {
  userId: string;
  stageConfig: Stage;
}) {
  const BASE_SCORE = 10;
  const sounds = useSound();
  const router = useRouter();
  const lastWarnSecRef = useRef<number>(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [puzzle, setPuzzle] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(stageConfig.time);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  // ================= LOAD PUZZLE =================
  async function loadPuzzle() {
    const data = await getPuzzle(stageConfig.id);
    setPuzzle(data);
    setFeedback("");
    setTimeLeft(stageConfig.time);
    lastWarnSecRef.current = -1;
  }

  useEffect(() => {
    loadPuzzle();
  }, [stageConfig.id]);

  // ================= TIMER =================
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      sounds.playGameOver();
      setGameOver(true);
      setFeedback("⏰ Time's Up! Game Over");
      updateScore(score);
      return;
    }

    timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 0.1), 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameOver]);

  // ================= WARNING SOUND =================
  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;

    const sec = Math.ceil(timeLeft);
    if (sec <= 10 && sec !== lastWarnSecRef.current) {
      lastWarnSecRef.current = sec;
      sounds.playTimeWarning();
    }
    if (sec > 10) lastWarnSecRef.current = -1;
  }, [timeLeft, gameOver]);

  // ================= SCORE SAVE =================
  async function updateScore(finalScore: number) {
    try {
      await fetch("/api/game/updateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          score: finalScore,
          correctAnswers,
          stage: stageConfig.id,
        }),
      });
    } catch {
      console.log("Score update failed");
    }
  }

  // ================= SAVE STAGE PROGRESS =================
  const saveProgress = () => {
    const completedStages = JSON.parse(localStorage.getItem("completedStages") || "[]");
    if (!completedStages.includes(stageConfig.id)) {
      completedStages.push(stageConfig.id);
      localStorage.setItem("completedStages", JSON.stringify(completedStages));
    }
  };

  // ================= SUBMIT =================
  function submit() {
    if (!puzzle || gameOver) return;

    if (parseInt(answer) === puzzle.solution) {
      sounds.playCorrect();

      const newSolved = puzzlesSolved + 1;
      const newScore = score + BASE_SCORE * (1 + combo * 0.5);

      setPuzzlesSolved(newSolved);
      setScore(newScore);
      setCombo(combo + 1);
      setCoins(coins + 10);
      setCorrectAnswers((prev) => prev + 1);

      if (newSolved >= stageConfig.puzzles) {
        sounds.playStageUp();
        setGameOver(true);
        setFeedback("🎉 Stage Completed!");
        updateScore(newScore);
        saveProgress();

        setTimeout(() => router.push("/game-map"), 1500);
        return;
      }

      setFeedback(`✅ Correct! (${newSolved}/${stageConfig.puzzles})`);
      setTimeout(() => loadPuzzle(), 1000);
    } else {
      sounds.playWrong();
      setFeedback("❌ Wrong! Game Over");
      setGameOver(true);
      setCombo(0);
      updateScore(score);
    }

    setAnswer("");
  }

  // ================= RESTART =================
  function restartGame() {
    setScore(0);
    setCoins(0);
    setCombo(0);
    setCorrectAnswers(0);
    setPuzzlesSolved(0);
    setGameOver(false);
    loadPuzzle();
  }

  // ================= SKIP =================
  function skipPuzzle() {
    if (coins < 20) {
      sounds.playWrong();
      setFeedback("❌ Not enough coins!");
      return;
    }

    sounds.playSkip();
    setCoins(coins - 20);
    loadPuzzle();
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ================= UI =================
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-6 py-8 bg-purple-900/80 backdrop-blur-md text-white">

      <h1 className="text-4xl font-bold mb-6 text-center drop-shadow-lg">🍌 {stageConfig.name}</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl mb-6">
        <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <p className="text-lg mb-2">Progress: {puzzlesSolved} / {stageConfig.puzzles}</p>
          <p className="text-lg mb-2">Score: {score}</p>
          <p className="text-lg">Coins: {coins}</p>
        </div>

        <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg text-center">
          {!gameOver && (
            <>
              <p className="text-lg mb-2 font-bold">Time: {formatTime(timeLeft)}</p>
              <TimerBar time={timeLeft} maxTime={stageConfig.time} />
              <button
                onClick={skipPuzzle}
                className="mt-4 w-full py-2 rounded-lg bg-purple-600/50 hover:bg-purple-500/70 transition-colors duration-200"
              >
                Skip (-20 coins)
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg mb-6">
        {puzzle && (
          <img src={puzzle.question} alt="Puzzle" className="w-full rounded-xl mb-4" />
        )}
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter answer"
          disabled={gameOver}
          className="w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 mb-4"
        />
        {!gameOver ? (
          <button
            onClick={submit}
            className="w-full py-3 rounded-lg bg-purple-500/70 hover:bg-purple-400/80 text-white font-bold transition-all duration-200 mb-2"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="w-full py-3 rounded-lg bg-red-500/70 hover:bg-red-400/80 text-white font-bold transition-all duration-200 mb-2"
          >
            Restart Stage
          </button>
        )}
        <button
          onClick={() => router.push("/game-map")}
          className="w-full py-3 rounded-lg bg-purple-700/50 hover:bg-purple-600/70 text-white font-bold transition-all duration-200 mt-2"
        >
          Back to Map
        </button>

        {feedback && <p className="mt-4 text-center text-lg font-semibold">{feedback}</p>}
      </div>
    </div>
  );
}