import { useEffect, useState } from "react";
import type { Tables } from "../lib/database.types";
import { supabase } from "../lib/supabase-client";
import type {
  TriviaGuessDTO,
  TriviaRoundGenerationDTO,
} from "../lib/dto.types";

function App() {
  const [currentTrivia, setCurrentTrivia] =
    useState<TriviaRoundGenerationDTO | null>(null);
  const [roundResult, setRoundResult] = useState<TriviaGuessDTO | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    // TODO: This should definitely be calculated on the server, not here lol
    async function fetchAllTriviaRounds() {
      const { data, error } = await supabase.from("trivia_rounds").select("*");
      if (error) {
        setErrorInfo(error.message);
        return null;
      }
      setScore(
        data.filter((t) => t.correct_answer_index === t.selected_answer_index)
          .length,
      );
    }
    fetchAllTriviaRounds();
  }, []);

  async function handleGenerateTriviaRound() {
    if (isGenerating || isSubmitting) return;
    setIsGenerating(true);
    const { data, error } =
      await supabase.functions.invoke<TriviaRoundGenerationDTO>(
        "generate-question",
      );
    if (error) {
      setErrorInfo(error.message);
      setIsGenerating(false);
      setRoundResult(null);
      return;
    }
    setCurrentTrivia(data);
    setRoundResult(null);
    setIsGenerating(false);
  }

  async function handleTriviaSelection(selectedIndex: number) {
    if (isGenerating || isSubmitting || roundResult) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.functions.invoke<TriviaGuessDTO>(
      "submit-answer",
      {
        body: {
          triviaId: currentTrivia?.id,
          selectedIndex,
        },
      },
    );
    if (error) {
      setErrorInfo(error.message);
      setIsSubmitting(false);
      return;
    }
    setRoundResult(data);
    setIsSubmitting(false);
    if (data?.correct) setScore((curr) => curr + 1);
  }

  return (
    <main className="max-w-6xl mx-auto p-12 rounded-lg border mt-8 text-center">
      <h1 className="text-4xl">AI Trivia Arena</h1>
      <p>Score: {score}</p>
      {(!currentTrivia || roundResult) && (
        <button
          onClickCapture={handleGenerateTriviaRound}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-500 text-white cursor-pointer transition-colors ${isGenerating && "opacity-80 cursor-wait"}`}
        >
          {isGenerating
            ? "Loading..."
            : currentTrivia
              ? "Next round"
              : "Start game"}
        </button>
      )}
      <div>
        {currentTrivia && (
          <div>
            <h3>{currentTrivia.trivia_question}</h3>
            <ul className="max-w-xl mx-auto">
              {currentTrivia.answers.map((answer, index) => (
                <li key={answer}>
                  <button
                    onClick={() => handleTriviaSelection(index)}
                    className={`w-full border-b cursor-pointer px-4 py-2 hover:bg-slate-100 ${roundResult && roundResult?.correctAnswerIndex === index ? "bg-green-200" : roundResult?.selectedAnswerIndex === index && "bg-red-200"}`}
                  >
                    {answer}
                  </button>
                </li>
              ))}
            </ul>
            {roundResult && <p>Explanation: {roundResult.explanation}</p>}
          </div>
        )}
      </div>
      {errorInfo && (
        <p className="text-red-500">Some error occurred: {errorInfo}</p>
      )}
    </main>
  );
}

export default App;
