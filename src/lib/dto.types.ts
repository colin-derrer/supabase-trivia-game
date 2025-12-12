export type TriviaRoundGenerationDTO = {
  id: number;
  trivia_question: string;
  answers: string[];
};

export type TriviaGuessDTO = {
  explanation: string;
  correctAnswerIndex: number;
  selectedAnswerIndex: number;
  correct: boolean;
};
