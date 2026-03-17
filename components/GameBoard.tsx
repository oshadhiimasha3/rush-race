"use client";

import { useState, useEffect, useRef } from "react";
import { getPuzzle } from "../lib/bananaAPI";
import TimerBar from "./TimerBar";

export default function GameBoard({ userId }: { userId: string }) {

  const START_TIME = 30;
  const MIN_TIME = 5;
  const TIME_DECREMENT = 5;
  const BASE_SCORE = 10;

  const [puzzle, setPuzzle] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(START_TIME);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const timerRef = useRef<any>(null);

  async function loadPuzzle(isFirst = false){
    const data = await getPuzzle();
    setPuzzle(data);
    setFeedback("");

    const newTimeLimit = isFirst
      ? START_TIME
      : Math.max(MIN_TIME, currentTimeLimit - TIME_DECREMENT);

    setCurrentTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
  }

  useEffect(()=>{ loadPuzzle(true); },[]);

  useEffect(()=>{
    if(gameOver) return;

    if(timeLeft <= 0){
      setGameOver(true);
      setFeedback("⏰ Time's Up! Game Over");
      setCombo(0);
      updateScore(score);
      return;
    }

    timerRef.current = setTimeout(()=>setTimeLeft(timeLeft - 0.1),100);
    return ()=>clearTimeout(timerRef.current);
  },[timeLeft,gameOver]);

  async function updateScore(finalScore:number){
    try{
      await fetch("/api/game/updateScore",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ userId, score:finalScore, correctAnswers })
      })
    }catch{ console.log("Score update failed") }
  }

  function submit(){
    if(!puzzle || gameOver) return;

    if(parseInt(answer) === puzzle.solution){
      const newCombo = combo + 1
      const newScore = score + BASE_SCORE * (1 + combo * 0.5)

      setCombo(newCombo)
      setScore(newScore)
      setCoins(coins + 10)
      setCorrectAnswers(prev => prev + 1)
      setFeedback(`✅ Correct! +10 Coins! Combo x${newCombo}`)
      setTimeout(()=>loadPuzzle(),1200)
    } else {
      setFeedback("❌ Wrong! Game Over")
      setCombo(0)
      setGameOver(true)
      updateScore(score)
    }

    setAnswer("")
  }

  function restartGame(useCoins:boolean=false){
    if(useCoins){
      if(coins < 30){
        setFeedback("❌ Not enough coins to continue!");
        return;
      }
      setCoins(coins - 30);
      setGameOver(false);
      setFeedback("💪 Continued! Good luck!");
      setTimeLeft(START_TIME);
      return;
    }

    setScore(0)
    setCoins(0)
    setCombo(0)
    setCorrectAnswers(0)
    setCurrentTimeLimit(START_TIME)
    setTimeLeft(START_TIME)
    setGameOver(false)
    loadPuzzle(true)
  }

  function skipPuzzle(){
    if(coins < 20){
      setFeedback("❌ Not enough coins to skip!");
      return;
    }
    setCoins(coins - 20);
    loadPuzzle();
    setFeedback("⏩ Puzzle Skipped!");
  }

  return(
    <div className="flex flex-col items-center justify-start pt-2 px-4 pb-8 w-full"> {/* Added pb-8 for bottom space */}

      {/* =================== Score & Coins HUD =================== */}
      <div className="mb-4 flex items-center gap-6 justify-center w-full max-w-md">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-2xl shadow-lg text-center animate-pulse w-36">
          <h2 className="text-lg font-bold">Score: {score.toFixed(0)}</h2>
        </div>

        <div className="flex items-center gap-2 bg-yellow-200/80 px-4 py-2 rounded-2xl shadow-lg justify-center w-36">
          <span className="text-yellow-400 text-3xl animate-bounce-glow"
            style={{ textShadow:"0 0 5px #fff, 0 0 10px #ffeb3b, 0 0 20px #ffeb3b, 0 0 30px #ffeb3b" }}>🪙</span>
          <span className="text-gray-900 font-bold text-xl animate-bounce-glow">x{coins}</span>
        </div>
      </div>

      {/* =================== Puzzle Box =================== */}
      <div className="bg-yellow-50/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-6">
        {puzzle && (
          <img
            src={puzzle.question}
            alt="Puzzle"
            className="w-full h-auto rounded-xl shadow-lg mb-4"
            style={{ maxHeight: "500px", objectFit: "contain" }}
          />
        )}

        {!gameOver && (
          <>
            <div className="w-full mb-4">
              <div className="flex justify-between mb-1 text-gray-800 font-bold">
                <span>Time Left:</span>
                <span>{timeLeft.toFixed(1)}s</span>
              </div>
              <TimerBar time={timeLeft} maxTime={currentTimeLimit}/>
            </div>

            {/* Skip Puzzle */}
            <button
              onClick={skipPuzzle}
              className="w-full py-3 bg-orange-400 text-black font-bold rounded-xl hover:bg-orange-500 active:scale-95 transition-transform duration-150 shadow-lg"
            >
              Skip Puzzle (-20 Coins)
            </button>
          </>
        )}
      </div>

      {/* =================== Answer & Actions Box =================== */}
      <div className="bg-yellow-100/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-lg space-y-4">
        <input
          value={answer}
          onChange={(e)=>setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-900 font-semibold bg-yellow-50 placeholder:text-gray-500 transition duration-200"
          disabled={gameOver}
        />

        {!gameOver ? (
          <button
            onClick={submit}
            className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 active:scale-95 transition-transform duration-150 shadow-lg"
          >
            Submit
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={()=>restartGame()}
              className="w-full py-3 bg-red-500 text-white font-bold hover:bg-red-600 rounded-xl active:scale-95 transition-transform duration-150 shadow-lg"
            >
              Restart Game
            </button>
            <button
              onClick={()=>restartGame(true)}
              className="w-full py-3 bg-yellow-400 text-black font-bold hover:bg-yellow-500 rounded-xl active:scale-95 transition-transform duration-150 shadow-lg"
            >
              Continue Game (-30 Coins)
            </button>
          </div>
        )}

        {feedback && (
          <p
            className={`mt-2 font-semibold ${
              feedback.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  )
}