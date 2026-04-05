export type Stage = {
  id: number;
  name: string;
  puzzles: number;
  time: number;
};

export const STAGES: Stage[] = [
  { id: 1, name: "Stage 1", puzzles: 2, time: 60 },
  { id: 2, name: "Stage 2", puzzles: 3, time: 45 },
  { id: 3, name: "Stage 3", puzzles: 4, time: 40 },
  { id: 4, name: "Stage 4", puzzles: 5, time: 35 },
  { id: 5, name: "Stage 5", puzzles: 6, time: 30 },
];