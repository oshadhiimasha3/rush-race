"use client";

import { useParams } from "next/navigation";
import GameBoard from "../../../components/GameBoard";
import { STAGES, Stage } from "../../../lib/stages";

export default function PlayPage() {
  const params = useParams();

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
        ❌ Invalid Stage (ID: {stageId})
      </div>
    );
  }

  return <GameBoard userId="guest" stageConfig={stage} />;
}