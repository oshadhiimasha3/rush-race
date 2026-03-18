"use client";

interface TimerBarProps {
  time: number;        // Current remaining time (seconds)
  maxTime: number;     // max time for progress bar calculation
}

export default function TimerBar({ time, maxTime }: TimerBarProps) {
  // Calculate percentage of time left relative to maxTime, capped at 100%
  const percent = Math.min((time / maxTime) * 100, 100);

  return (
    <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
      <div
        className="h-4 bg-yellow-400 transition-all duration-100 linear"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}