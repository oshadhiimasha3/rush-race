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
    const data = await getPuzzle(stageConfig.id); // ✅ keep API same
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

      // ✅ STAGE COMPLETE
      if (newSolved >= stageConfig.puzzles) {
        sounds.playStageUp();
        setGameOver(true);
        setFeedback("🎉 Stage Completed!");
        updateScore(newScore);
        saveProgress();

        // redirect back to map after short delay
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

  // ================= UI =================
  return (
    <div className="flex flex-col items-center justify-start pt-6 px-4 pb-10 w-full">
      <h1 className="text-3xl font-bold mb-4 text-white">🍌 {stageConfig.name}</h1>
      <p className="mb-4 text-white">
        Progress: {puzzlesSolved} / {stageConfig.puzzles}
      </p>
      <div className="mb-4 text-white text-xl">Score: {score}</div>

      <div className="bg-yellow-100 p-6 rounded-xl w-full max-w-md text-center">
        {puzzle && <img src={puzzle.question} alt="Puzzle" className="w-full mb-4 rounded-lg" />}
        {!gameOver && (
          <>
            <p className="mb-2 font-bold">Time: {timeLeft.toFixed(1)}s</p>
            <TimerBar time={timeLeft} maxTime={stageConfig.time} />
            <button onClick={skipPuzzle} className="mt-3 w-full bg-orange-400 py-2 rounded-lg">
              Skip (-20 coins)
            </button>
          </>
        )}
      </div>

      <div className="mt-4 w-full max-w-md">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter answer"
          className="w-full p-3 rounded-lg border"
          disabled={gameOver}
        />

        {!gameOver ? (
          <button onClick={submit} className="mt-3 w-full bg-yellow-400 py-3 rounded-lg">
            Submit
          </button>
        ) : (
          <button onClick={restartGame} className="mt-3 w-full bg-red-500 py-3 rounded-lg text-white">
            Restart Stage
          </button>
        )}

        {feedback && <p className="mt-3 font-bold text-center">{feedback}</p>}
      </div>
    </div>
  );
}