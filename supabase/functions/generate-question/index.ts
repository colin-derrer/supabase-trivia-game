import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { openai } from "npm:@ai-sdk/openai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateObject } from "npm:ai";
import { z } from "npm:zod@4.1.13";
import { type Database } from "../../../src/lib/database.types.ts";
import { type TriviaRoundGenerationDTO } from "../../../src/lib/dto.types.ts";

// The reason why I'm not going to have an array of wrong answers is because I want to constrain the LLM as much as possible.
const triviaSchema = z.object({
  trivia_question: z.string(),
  explanation: z.string(),
  correct_answer: z.string(),
  wrong_answer_1: z.string(),
  wrong_answer_2: z.string(),
  wrong_answer_3: z.string(),
});

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const STATIC_LLM_RESPONSE: z.infer<typeof triviaSchema> = {
  trivia_question:
    "Which element has the highest melting point among all pure elements?",
  correct_answer: "Tungsten",
  wrong_answer_1: "Tantalum",
  wrong_answer_2: "Rhenium",
  wrong_answer_3: "Molybdenum",
  explanation:
    "Tungsten has the highest melting point of any element, about 3422°C (6192°F) at standard atmospheric pressure. This exceptional heat resistance comes from its very strong metallic bonds and its body-centered cubic crystal structure, which give it a high cohesive energy and make it extremely difficult to break apart the solid lattice.",
};

Deno.serve(async () => {
  try {
    let llmResponse: z.infer<typeof triviaSchema>;
    if (z.stringbool().parse(Deno.env.get("CONFIG_MOCK_API_RESPONSE"))) {
      llmResponse = STATIC_LLM_RESPONSE;
    } else {
      try {
        const { object } = await generateObject({
          model: openai("gpt-5-nano"),
          schema: triviaSchema,
          prompt:
            "Generate a random trivia question, a correct answer, some wrong answers, and some exposition/explanation about why it's the correct answer.",
        });
        // Instead of accessing .object and wrapping the await, I'd rather destructure because I'd eventually want to use other properties on the generatObject response
        llmResponse = object;
      } catch (llmError) {
        // I want to handle the error here rather than letting it hit the generic request error handler so that there's a cleaner break about where I would insert retry logic
        console.error(llmError);
        return new Response("There was an error generating the question", {
          status: 500,
        });
      }
    }

    // Shuffle the responses around (please i'll do leetcode later it's 11:30 pm)
    const answers = [
      llmResponse.wrong_answer_1,
      llmResponse.wrong_answer_2,
      llmResponse.wrong_answer_3,
    ];
    const correctAnswerIdx = Math.floor(Math.random() * (answers.length + 1));
    if (correctAnswerIdx == answers.length) {
      answers.push(llmResponse.correct_answer);
    } else {
      answers.splice(correctAnswerIdx, 0, llmResponse.correct_answer);
    }

    if (answers[correctAnswerIdx] !== llmResponse.correct_answer)
      throw new Error(
        "Why Unit Testing Is Important: A Novel About Sanity Checks",
      );

    const { data: triviaDataArray, error: supabaseError } = await supabase
      .from("trivia_rounds")
      .insert({
        correct_answer_index: correctAnswerIdx,
        trivia_question: llmResponse.trivia_question,
        explanation: llmResponse.explanation,
        answer_0: answers[0],
        answer_1: answers[1],
        answer_2: answers[2],
        answer_3: answers[3],
      })
      .select();
    if (supabaseError) {
      console.error(supabaseError);
      return new Response("There was an error contacting the database", {
        status: 500,
      });
    }

    const [triviaData] = triviaDataArray;
    const triviaDto: TriviaRoundGenerationDTO = {
      id: triviaData.id,
      trivia_question: triviaData.trivia_question,
      answers,
    };

    return new Response(JSON.stringify(triviaDto), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (unknownError) {
    console.error(unknownError);
    return new Response("Something went wrong", { status: 500 });
  }
});
