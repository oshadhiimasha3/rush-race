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
  const [stageCompleted, setStageCompleted] = useState(false);
  const [paused, setPaused] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  // --- USER-SPECIFIC STORAGE KEYS ---
  const stageScoreKey = `stageScores_${userId}`;
  const totalCoinsKey = `totalCoins_${userId}`;

  // Load user-specific saved score and coins
  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem(stageScoreKey) || "{}");
    const savedCoins = parseInt(localStorage.getItem(totalCoinsKey) || "0");
    // Calculate total score up to previous stages
    let totalScore = 0;
    for (const s in savedScores) {
      totalScore += savedScores[s];
    }
    setScore(totalScore);
    setCoins(savedCoins);
  }, [userId]);

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
    if (gameOver || paused || stageCompleted) return;

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
  }, [timeLeft, gameOver, paused, stageCompleted]);

  // ================= WARNING SOUND =================
  useEffect(() => {
    if (gameOver || paused || timeLeft <= 0 || stageCompleted) return;

    const sec = Math.ceil(timeLeft);
    if (sec <= 10 && sec !== lastWarnSecRef.current) {
      lastWarnSecRef.current = sec;
      sounds.playTimeWarning();
    }
    if (sec > 10) lastWarnSecRef.current = -1;
  }, [timeLeft, gameOver, paused, stageCompleted]);

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

  const saveProgress = (stageScore: number) => {
    const savedScores = JSON.parse(localStorage.getItem(stageScoreKey) || "{}");
    savedScores[stageConfig.id] = stageScore;
    localStorage.setItem(stageScoreKey, JSON.stringify(savedScores));
    localStorage.setItem(totalCoinsKey, coins.toString());
  };

  function submit() {
    if (!puzzle || gameOver || paused || stageCompleted) return;

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

        setStageCompleted(true);
        setGameOver(false);

        setFeedback("🎉 Stage Completed!");
        updateScore(newScore);
        saveProgress(newScore);

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

  function restartGame() {
    setScore(0);
    setCoins(0);
    setCombo(0);
    setCorrectAnswers(0);
    setPuzzlesSolved(0);
    setGameOver(false);
    setStageCompleted(false);
    setPaused(false);
    loadPuzzle();
  }

  function skipPuzzle() {
    if (coins < 20 || paused || stageCompleted) {
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

  return (
    <div className="min-h-screen bg-purple-900/90 text-white">

      {/* NAVBAR */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-md shadow-md">
        <button
          onClick={() => router.push("/game-map")}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
        >
          ← Map
        </button>

        <h1 className="text-xl font-bold">
          🍌 {stageConfig.name}
        </h1>

        <button
          onClick={() => setPaused(!paused)}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500"
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* TOP STATS */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-3 gap-4 mt-6 px-6">
        <div className="bg-white/10 p-4 rounded-xl text-center">
          <p>Progress</p>
          <p className="font-bold">{puzzlesSolved}/{stageConfig.puzzles}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center">
          <p>Score</p>
          <p className="font-bold">{score}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center">
          <p>🪙 Coins</p>
          <p className="font-bold">{coins}</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 py-8">

        {/* LEFT */}
        <div className="bg-white/10 rounded-2xl p-6 flex items-center justify-center">
          {puzzle && (
            <img
              src={puzzle.question}
              alt="Puzzle"
              className="w-full max-h-[400px] object-contain rounded-xl"
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white/10 rounded-2xl p-6 flex flex-col">

          {!gameOver && !stageCompleted && (
            <div className="mb-6 text-center">
              <div className="text-4xl font-mono bg-black/40 py-3 rounded-xl">
                ⏱ {formatTime(timeLeft)}
              </div>
              <div className="mt-2">
                <TimerBar time={timeLeft} maxTime={stageConfig.time} />
              </div>
            </div>
          )}

          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={gameOver || paused || stageCompleted}
            placeholder="Enter answer..."
            className="p-4 rounded-xl bg-white/10 border border-white/30 mb-4"
          />

          <button
            onClick={submit}
            disabled={gameOver || paused || stageCompleted}
            className="py-3 bg-purple-500 rounded-xl disabled:opacity-50"
          >
            Submit
          </button>

          {!gameOver && !stageCompleted && (
            <button
              onClick={skipPuzzle}
              disabled={paused}
              className="mt-3 py-2 bg-purple-700 rounded-xl"
            >
              Skip (-20 coins)
            </button>
          )}

          {feedback && (
            <p className="mt-4 text-center font-semibold">{feedback}</p>
          )}
        </div>
      </div>

      {/* PAUSE OVERLAY */}
      {paused && !gameOver && !stageCompleted && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">⏸ Game Paused</h2>
            <button
              onClick={() => setPaused(false)}
              className="px-6 py-3 bg-purple-500 rounded-xl"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameOver && !stageCompleted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center shadow-2xl w-[90%] max-w-md">

            <h2 className="text-4xl font-bold mb-4 text-red-400">
              💀 Game Over
            </h2>

            <p className="mb-2 text-lg">Score: {score}</p>
            <p className="mb-6 text-lg">Solved: {puzzlesSolved}</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={restartGame}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-400 font-bold text-lg"
              >
                🔁 Retry Stage
              </button>

              <button
                onClick={() => router.push("/game-map")}
                className="py-3 rounded-xl bg-gray-700 hover:bg-gray-600 font-bold text-lg"
              >
                🗺 Back to Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}