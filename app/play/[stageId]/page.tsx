"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import GameBoard from "../../../components/GameBoard";
import { STAGES, Stage } from "../../../lib/stages";

export default function PlayPage() {
  const params = useParams();
  const [userId, setUserId] = useState<string>("guest");

  // Read the real userId from localStorage (set by login page)
  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "guest";
    setUserId(storedId);
  }, []);

  const rawStageId = params?.stageId;

  const stageId = Array.isArray(rawStageId)
    ? Number(rawStageId[0])
    : Number(rawStageId);

  const stage: Stage | undefined = STAGES.find(
    (s) => s.id === stageId
  );

  if (!stage) {
    return (
      <div className="text-center mt-10 text-red-500">
        Invalid Stage (ID: {stageId})
      </div>
    );
  }

  return <GameBoard userId={userId} stageConfig={stage} />;
}