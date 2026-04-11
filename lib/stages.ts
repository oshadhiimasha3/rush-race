export type Stage = {
  id: number;
  name: string;
  puzzles: number;
  time: number; // time in seconds
};


export const STAGES: Stage[] = [
  { id: 1, name: "Stage 1", puzzles: 2, time: 90 },  // 1:30
  { id: 2, name: "Stage 2", puzzles: 3, time: 75 },  // 1:15
  { id: 3, name: "Stage 3", puzzles: 3, time: 60 },  // 1:00
  { id: 4, name: "Stage 4", puzzles: 4, time: 50 },  // 0:50
  { id: 5, name: "Stage 5", puzzles: 4, time: 45 },  // 0:45
  { id: 6, name: "Stage 6", puzzles: 5, time: 40 },  // 0:40
  { id: 7, name: "Stage 7", puzzles: 5, time: 35 },  // 0:35
  { id: 8, name: "Stage 8", puzzles: 6, time: 30 },  // 0:30
  { id: 9, name: "Stage 9", puzzles: 6, time: 25 },  // 0:25
];