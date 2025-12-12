import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as z from "npm:zod@4.1.13";
import { type Database } from "../../../src/lib/database.types.ts";
import { type TriviaGuessDTO } from "../../../src/lib/dto.types.ts";

const requestSchema = z.object({
  triviaId: z.number().int(),
  selectedIndex: z.number().int().min(0).max(3),
});

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  try {
    const json = await req.json();
    const { triviaId, selectedIndex } = await requestSchema.parseAsync(json);

    const { data: triviaDataArray, error: supabaseError } = await supabase
      .from("trivia_rounds")
      .update({ selected_answer_index: selectedIndex })
      .eq("id", triviaId)
      .select();

    if (supabaseError) {
      console.error(supabaseError);
      return new Response("There was an error contacting the database", {
        status: 500,
      });
    }

    const [triviaData] = triviaDataArray;
    const triviaResultDto: TriviaGuessDTO = {
      explanation: triviaData.explanation,
      selectedAnswerIndex: selectedIndex,
      correctAnswerIndex: triviaData.correct_answer_index,
      correct: triviaData.correct_answer_index === selectedIndex,
    };

    return new Response(JSON.stringify(triviaResultDto), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Stop sending us weird stuff", { status: 418 });
    }
    console.error(err);
    return new Response("Something went wrong", { status: 500 });
  }
});
