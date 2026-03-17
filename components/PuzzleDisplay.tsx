export default function PuzzleDisplay({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt="Puzzle"
      className="w-full h-auto rounded-xl shadow-lg mb-4"
      style={{ maxHeight: "350px", objectFit: "contain" }}
    />
  );
}