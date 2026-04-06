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

  // === Stage background images (public folder)
  const stageBackgrounds = [
    "/stage12.jpeg",
    "/stage14.jpeg",
    "/stage18.jpeg",
    "/stage15.jpeg",
    "/stage13.png",
    "/stage17.jpeg",
    "/stage16.jpeg",
    "/stage1.jpeg",
    "/stage19.jpeg",
  ];
  const backgroundImage = stageBackgrounds[stageConfig.id - 1] || "";

  // === Game states
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
  const [loadingUser, setLoadingUser] = useState(true);

  // === Load total score from backend or localStorage
  useEffect(() => {
    async function fetchUserStats() {
      try {
        const savedScore = Number(localStorage.getItem("totalScore")) || 0;
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          const backendScore = data.stats.totalScore || 0;
          const initialScore = Math.max(savedScore, backendScore);
          setScore(initialScore);
          setCoins(data.stats.coins || 0);
          setCorrectAnswers(data.stats.correctAnswers || 0);
          localStorage.setItem("totalScore", initialScore.toString());
        }
      } catch (err) {
        console.log("Failed to load user stats", err);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUserStats();
  }, [userId]);

  // === Load puzzle
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

  // === Timer
  useEffect(() => {
    if (gameOver || paused || stageCompleted) return;
    if (timeLeft <= 0) {
      sounds.playGameOver();
      setGameOver(true);
      setFeedback("⏰ Time's Up! Game Over");
      setCombo(0);
      saveScore();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 0.1), 100);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameOver, paused, stageCompleted]);

  // === Time warning
  useEffect(() => {
    if (gameOver || paused || timeLeft <= 0 || stageCompleted) return;
    const sec = Math.floor(timeLeft);
    if (sec <= 10 && sec !== lastWarnSecRef.current) {
      lastWarnSecRef.current = sec;
      sounds.playTimeWarning();
    }
    if (sec > 10) lastWarnSecRef.current = -1;
  }, [timeLeft, gameOver, paused, stageCompleted]);

  // === Save score to localStorage + backend
  async function saveScore() {
    localStorage.setItem("totalScore", score.toString());
    try {
      await fetch("/api/game/updateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          score,
          correctAnswers,
        }),
      });
    } catch {
      console.log("Score update failed");
    }
  }

  // === Submit answer
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

        const completed = JSON.parse(localStorage.getItem("completedStages") || "[]");
        if (!completed.includes(stageConfig.id)) {
          completed.push(stageConfig.id);
          localStorage.setItem("completedStages", JSON.stringify(completed));
        }

        saveScore();
        setTimeout(() => router.push("/game-map"), 1500);
        return;
      }

      setFeedback(`Correct! (${newSolved}/${stageConfig.puzzles})`);
      setTimeout(() => loadPuzzle(), 1000);
    } else {
      sounds.playWrong();
      setFeedback("Wrong! Game Over");
      setGameOver(true);
      setCombo(0);
      saveScore();
    }

    setAnswer("");
  }

  // === Restart / Retry Stage
  function restartGame() {
    setCombo(0);
    setPuzzlesSolved(0);
    setStageCompleted(false);
    setGameOver(false);
    setPaused(false);
    setFeedback("");
    setTimeLeft(stageConfig.time);
    loadPuzzle();
  }

  function skipPuzzle() {
    if (coins < 20 || paused || stageCompleted) {
      sounds.playWrong();
      setFeedback(" Not enough coins!");
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

  if (loadingUser) return <div className="text-center mt-10">Loading...</div>;

  // === Clock color
  let timeColor = "text-white";
  if (timeLeft <= 6) timeColor = "animate-flashText font-bold";
  else if (timeLeft <= 11) timeColor = "text-yellow-400 font-bold";

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white overflow-x-hidden relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

      {/* NAVBAR */}
      <div className="relative z-10 w-full flex justify-between items-center px-5 py-3  bg-white/10 backdrop-blur-l border-b border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <button
          onClick={() => router.push("/game-map")}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
        >
           Map
        </button>

        <h1 className="text-xl font-bold">🍌 {stageConfig.name}</h1>

        <button
          onClick={() => setPaused(!paused)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* TOP STATS */}
      <style>{`
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 rgba(255,255,255,0.2);} 50% {box-shadow:0 0 25px rgba(255,255,255,0.6);} }
        .animate-glow1, .animate-glow2, .animate-glow3 { animation: glowPulse 2s infinite; }
        @keyframes flashText { 0% { color: #ff0000; text-shadow: 0 0 10px #ff0000;} 50% { color: #ff5555; text-shadow:0 0 20px #ff5555;} 100% { color: #ff0000; text-shadow: 0 0 10px #ff0000;} }
        .animate-flashText { animation: flashText 0.5s infinite; }
        .card-glow { box-shadow: 0 0 25px rgba(255,255,255,0.5); transition: box-shadow 0.3s; }
      `}</style>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-3 gap-8 mt-10 px-6">
        <div className="bg-white/10 p-4 rounded-xl text-center animate-glow1 card-glow">
          <p>Progress</p>
          <p className="font-bold">{puzzlesSolved}/{stageConfig.puzzles}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center animate-glow2 card-glow">
          <p>Score</p>
          <p className="font-bold">{score}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center animate-glow3 card-glow">
          <p>🪙 Coins</p>
          <p className="font-bold">{coins}</p>
        </div>
      </div>

      {/* MAIN UI */}
      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-15 px-6 py-8 mt-5">
        {/* LEFT: Puzzle */}
        <div className="bg-white/10 rounded-2xl p-6 flex items-start justify-start card-glow">
          {puzzle && (
            <img
              src={puzzle.question}
              alt="Puzzle"
              className="w-full max-w-[500px] h-[400px] object-contain rounded-xl"
            />
          )}
        </div>

        {/* RIGHT: Input / Actions */}
        <div className="bg-white/10 rounded-2xl p-6 flex flex-col card-glow">

          {!gameOver && !stageCompleted && (
            <div className="mb-6 text-center">
              <div className={`text-4xl font-mono bg-black/40 py-3 rounded-xl ${timeColor}`}>
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
            className="p-4 rounded-xl bg-white/10 border border-white/30 mb-7"
          />

          <button
            onClick={submit}
            disabled={gameOver || paused || stageCompleted}
            className="relative flex items-center justify-center border border-white/20 bg-white/10 text-white font-bold py-3 mb-5 rounded-xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            Submit
            <span className="absolute inset-0 rounded-xl opacity-20 bg-white/20 animate-ping"></span>
          </button>

          {!gameOver && !stageCompleted && (
            <button
              onClick={skipPuzzle}
              disabled={paused}
              className="relative mt-3 flex items-center justify-center border border-white/20 bg-white/10 text-white font-bold py-3 rounded-xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              Skip (-20 coins)
              <span className="absolute inset-0 rounded-xl opacity-20 bg-white/20 animate-ping"></span>
            </button>
          )}

          {feedback && <p className="mt-4 text-center font-semibold">{feedback}</p>}

          {(gameOver || stageCompleted) && (
            <button
              onClick={restartGame}
              className="mt-4 py-3 bg-green-600 rounded-xl text-lg font-bold hover:bg-green-500"
            >
              🔁 Retry Stage
            </button>
          )}
        </div>
      </div>

      {/* PAUSE / GAME OVER Modals */}
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

      {gameOver && !stageCompleted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center shadow-2xl w-[90%] max-w-md">
            <h2 className="text-4xl font-bold mb-4 text-red-400">💀 Game Over</h2>
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