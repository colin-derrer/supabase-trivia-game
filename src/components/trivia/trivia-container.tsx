import type { TriviaGuessDTO, TriviaRoundGenerationDTO } from "@/lib/dto.types";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../ui/button";
import { TriviaAnswer } from "./trivia-answer";

export function TriviaContainer({
  updateHack,
}: {
  updateHack: (whatever: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentTrivia, setCurrentTrivia] =
    useState<TriviaRoundGenerationDTO | null>(null);
  const [roundResult, setRoundResult] = useState<TriviaGuessDTO | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    generateRound();
    // Explicitly returning undefined so that if this function gets refactored, it won't implicitly return handleGenerateTriviaRound()
    return undefined;
  }, []);

  async function generateRound() {
    setIsLoading(true);
    const { data, error } =
      await supabase.functions.invoke<TriviaRoundGenerationDTO>(
        "generate-question",
      );
    if (error) {
      // this would be a good place to handle FunctionsHttpError, FunctionsRelayError, FunctionsFetchError
      setErrorText(error.message);
      setIsLoading(false);
      return;
    }
    setCurrentTrivia(data);
    setErrorText(null);
    setRoundResult(null);
    setSelectedIndex(null);
    setIsLoading(false);
  }

  function handleSelect(selection: number) {
    // Note: currentTrivia and isLoading are both tied together, but I want to keep the previous trivia on screen while the next one loads
    if (isLoading || isSubmitting || roundResult || !currentTrivia) return;
    setSelectedIndex(selection);
  }

  async function handleFormSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || isSubmitting || roundResult) return;
    setIsSubmitting(true);
    setErrorText(null);
    // This would be a great place to, if this app were a bit bigger, constrain the body's type to be related to the supabase's Zod parser
    const { data, error } = await supabase.functions.invoke<TriviaGuessDTO>(
      "submit-answer",
      {
        body: {
          triviaId: currentTrivia?.id,
          selectedIndex: selectedIndex,
        },
      },
    );
    if (error) {
      setErrorText(error.message);
      setIsSubmitting(false);
      return;
    }
    setRoundResult(data);
    setIsSubmitting(false);
    updateHack(Math.random());
  }

  return (
    <div className="max-w-4xl p-12 mx-auto text-center border rounded-lg bg-card">
      <div>
        <form onSubmit={handleFormSubmission}>
          <fieldset disabled={isSubmitting}>
            <legend className="w-full">
              {currentTrivia?.trivia_question ?? "Loading question..."}
            </legend>
            {currentTrivia?.answers.map((answer, index) => (
              <TriviaAnswer
                triviaAnswer={answer}
                key={answer}
                index={index}
                selectedIndex={selectedIndex}
                handleSelect={handleSelect}
                correctAnswerIndex={roundResult?.correctAnswerIndex ?? null}
              />
            ))}
          </fieldset>
          {errorText && <p className="text-destructive">{errorText}</p>}
          {!roundResult && !isLoading && (
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || selectedIndex === null}
              className="w-full h-auto py-2 mt-8 text-lg cursor-pointer"
            >
              Submit answer
            </Button>
          )}
        </form>
        {roundResult && <p className="my-2">{roundResult.explanation}</p>}
        {roundResult && (
          <Button
            type="button"
            onClick={generateRound}
            className="w-full h-auto py-2 mt-8 text-lg cursor-pointer"
          >
            {isLoading ? "Loading..." : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
