"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPuzzle } from "../lib/bananaAPI";
import TimerBar from "./TimerBar";
import { useSound } from "../context/SoundContext";
import { Stage } from "../lib/stages";
import PauseModal from "./PauseModal";
import GameOverModal from "./GameOverModal";
import StageCompletedModal from "./StageCompletedModal";

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

  const arenaNames = [
    "Misty Lakehouse",
    "Sunset Canyon",
    "Garden of Time",
    "Lakeside Drift",
    "Gloomy Peaks",
    "Speedway Bridge",
    "Obsidian Circuit",
    "Bluewater Bay",
    "Icy Heights",
  ];

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

  // snapshot of stats before stage
  const [initialStats, setInitialStats] = useState({
    score: 0,
    coins: 0,
    correctAnswers: 0,
  });

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

          // store snapshot
          setInitialStats({
            score: initialScore,
            coins: data.stats.coins || 0,
            correctAnswers: data.stats.correctAnswers || 0,
          });

          localStorage.setItem("totalScore", initialScore.toString());
        }
      } catch (err) {
        console.log("Failed to load user stats", err);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUserStats();
  }, [userId, stageConfig.id]);

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

      // revert
      setScore(initialStats.score);
      setCoins(initialStats.coins);
      setCorrectAnswers(initialStats.correctAnswers);

      saveScore(
        initialStats.score,
        initialStats.correctAnswers,
        initialStats.coins
      );
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

  // === Save score
  async function saveScore(
    overrideScore?: number,
    overrideCorrectAnswers?: number,
    overrideCoins?: number,
    overrideStage?: number
  ) {
    const finalScore =
      overrideScore !== undefined ? overrideScore : score;
    const finalCorrectAnswers =
      overrideCorrectAnswers !== undefined
        ? overrideCorrectAnswers
        : correctAnswers;
    const finalCoins =
      overrideCoins !== undefined ? overrideCoins : coins;
    const finalStage =
      overrideStage !== undefined ? overrideStage : stageConfig.id;

    localStorage.setItem("totalScore", finalScore.toString());

    try {
      await fetch("/api/game/updateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          score: finalScore,
          correctAnswers: finalCorrectAnswers,
          coins: finalCoins,
          currentStage: finalStage,
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
        setFeedback(" Stage Completed!");

        const completed = JSON.parse(localStorage.getItem("completedStages") || "[]");
        if (!completed.includes(stageConfig.id)) {
          completed.push(stageConfig.id);
          localStorage.setItem("completedStages", JSON.stringify(completed));
        }

        saveScore(newScore, correctAnswers + 1, coins + 10, stageConfig.id + 1);
        setTimeout(() => router.push("/game-map"), 1800);
        return;
      }

      setFeedback(`Correct! (${newSolved}/${stageConfig.puzzles})`);
      setTimeout(() => loadPuzzle(), 1000);
    } else {
      sounds.playWrong();
      setFeedback("Wrong! Game Over");
      setGameOver(true);
      setCombo(0);

      // revert
      setScore(initialStats.score);
      setCoins(initialStats.coins);
      setCorrectAnswers(initialStats.correctAnswers);

      saveScore(
        initialStats.score,
        initialStats.correctAnswers,
        initialStats.coins
      );
    }

    setAnswer("");
  }

  // === Handle Retry: deducts 30 coins from initialStats, updates snapshot, then restarts
  function handleRetry() {
    const newCoins = Math.max(0, initialStats.coins - 30);

    // Build new snapshot with deducted coins so restartGame never reverts above this
    const newInitialStats = {
      score: initialStats.score,
      coins: newCoins,
      correctAnswers: initialStats.correctAnswers,
    };

    // Update snapshot so future reverts respect the deduction
    setInitialStats(newInitialStats);

    // Reset game state using the updated snapshot
    setCombo(0);
    setPuzzlesSolved(0);
    setStageCompleted(false);
    setGameOver(false);
    setPaused(false);
    setFeedback("");
    setTimeLeft(stageConfig.time);
    setScore(newInitialStats.score);
    setCoins(newInitialStats.coins);
    setCorrectAnswers(newInitialStats.correctAnswers);

    // Persist deducted coins to backend
    saveScore(
      newInitialStats.score,
      newInitialStats.correctAnswers,
      newInitialStats.coins
    );

    loadPuzzle();
  }

  // === Restart (used for non-retry resets, keeps current initialStats)
  function restartGame() {
    setCombo(0);
    setPuzzlesSolved(0);
    setStageCompleted(false);
    setGameOver(false);
    setPaused(false);
    setFeedback("");
    setTimeLeft(stageConfig.time);

    // reset to snapshot
    setScore(initialStats.score);
    setCoins(initialStats.coins);
    setCorrectAnswers(initialStats.correctAnswers);

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

  // === Loader
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const minDisplayTimer = setTimeout(() => {
      setShowLoader(loadingUser);
    }, 2000);
    return () => clearTimeout(minDisplayTimer);
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      const hideTimer = setTimeout(() => setShowLoader(false), 2000);
      return () => clearTimeout(hideTimer);
    }
  }, [loadingUser]);

  if (showLoader)
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#01061C] overflow-hidden">
        {/* Neon star background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <span
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-white/80 animate-pulse-neon"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${10 + Math.random() * 6}s`,
                opacity: 0.7 + Math.random() * 0.3,
                boxShadow: `0 0 ${1 + Math.random() * 2}px rgba(255,255,255,0.8)`,
              }}
            />
          ))}
        </div>

        {/* Neon Loader */}
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative w-24 h-24 rounded-full border-4 border-purple-400/30 flex items-center justify-center animate-spin-slow">
            <div className="absolute w-20 h-20 border-4 border-t-purple-400 border-purple-400/40 rounded-full animate-spin-neon"></div>
            <div className="absolute w-16 h-16 border-2 border-t-purple-300 border-purple-300/50 rounded-full animate-pulse-neon"></div>
          </div>

          {/* Loading Text */}
          <p className="text-white text-xl opacity-80 tracking-wider glow-text text-center">
            Initializing Race ...
          </p>
        </div>
      </div>
    );

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
      <div className="relative z-10 w-full flex justify-between items-center px-5 py-3 bg-white/10 backdrop-blur-l border-b border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">

        {/* LEFT BUTTON */}
        <button
          onClick={() => router.push("/game-map")}
          className="flex items-center h-10 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 px-1 gap-0"
        >
          <img src="/mapicon.png" alt="Map Icon" className="w-25 h-25 object-contain" />
          <span className="text-white font-medium"></span>
        </button>

        {/* CENTER TITLE */}
        <div className="flex items-center justify-center gap-5">

          {/* LEFT Twinkling Bullet */}
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-bulletGlow"></span>

          {/* Constant Glow Title */}
          <h1 className="text-xl font-bold glow-text">
            Race Through The {arenaNames[stageConfig.id - 1] || `Race ${stageConfig.id}`}
          </h1>

          {/* RIGHT Twinkling Bullet */}
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-bulletGlow"></span>

        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => setPaused(!paused)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* NAVBAR ANIMATIONS */}
      <style jsx>{`
        /* Constant bright glow (no animation) */
        .glow-text {
          text-shadow:
            0 0 4px rgba(255,255,255,0.5),
            0 0 8px rgba(255,255,255,0.4),
            0 0 14px rgba(255,255,255,0.3);
        }

        @keyframes bulletGlow {
          0%, 100% {
            box-shadow:
              0 0 6px rgba(255,255,255,0.6),
              0 0 12px rgba(121, 117, 117, 0.4);
            opacity: 0.3;
          }
          50% {
            box-shadow:
              0 0 12px rgba(255,255,255,1),
              0 0 25px rgba(255,255,255,0.9),
              0 0 40px rgba(255,255,255,0.7);
            opacity: 1;
          }
        }

        .animate-bulletGlow {
          animation: bulletGlow 1.5s ease-in-out infinite;
          animation-delay: 0s;
          animation-fill-mode: both;
        }
      `}</style>

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
              <span className="absolute inset-0 rounded-xl opacity-20 bg-white/20 "></span>
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

      {/* ---------------- MODALS ---------------- */}

      {/* PAUSE MODAL */}
      {paused && !gameOver && !stageCompleted && (
        <PauseModal setPaused={setPaused} />
      )}

      {/* GAME OVER MODAL — passes handleRetry so 30 coins are deducted */}
      {gameOver && !stageCompleted && (
        <GameOverModal
          score={score}
          puzzlesSolved={puzzlesSolved}
          coins={coins}
          restartGame={handleRetry}
        />
      )}

      {/* STAGE COMPLETED MODAL */}
      {stageCompleted && !gameOver && (
        <StageCompletedModal
          score={score}
          puzzlesSolved={puzzlesSolved}
          stageId={stageConfig.id}
        />
      )}

    </div>
  );
}