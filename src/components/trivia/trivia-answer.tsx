import { cn } from "@/lib/utils";

type TriviaAnswer = {
  triviaAnswer: string;
  index: number;
  selectedIndex: number | null;
  correctAnswerIndex: number | null;
  handleSelect: (selected: number) => void;
};

// Note: This component knows way too much about other state; it would be best to define the correct state at a higher level
export function TriviaAnswer({
  triviaAnswer: answer,
  index,
  selectedIndex,
  correctAnswerIndex,
  handleSelect,
}: TriviaAnswer) {
  const isSelected = selectedIndex === index;
  const roundComplete = correctAnswerIndex !== null;
  return (
    <label
      className={cn(
        "flex gap-1 px-2 py-2 my-2 border rounded-md cursor-pointer hover:bg-primary/20 bg-card transition-colors",
        isSelected && "bg-primary/30",
        roundComplete && isSelected && "bg-red-300",
        correctAnswerIndex === index && "bg-green-300",
      )}
      key={answer}
    >
      <input
        type="radio"
        name="answer"
        value={index}
        checked={selectedIndex === index}
        onChange={(e) => handleSelect(+e.target.value)}
        className="mt-1 pointer-events-none size-4 shrink-0"
      />
      {answer}
    </label>
  );
}
