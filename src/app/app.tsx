import { TriviaContainer } from "@/components/trivia/trivia-container";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

function App() {
  const [score, setScore] = useState<number>(0);
  const [updateIt, setNewUpdateHack] = useState<number>(123);
  useEffect(() => {
    // TODO: This should definitely be calculated on the server, not here lol
    async function fetchAllTriviaRounds() {
      const { data, error } = await supabase.from("trivia_rounds").select("*");
      if (error) {
        console.error(error);
        return null;
      }
      setScore(
        data.filter((t) => t.correct_answer_index === t.selected_answer_index)
          .length,
      );
    }
    fetchAllTriviaRounds();
  }, [updateIt]);
  return (
    <main className="from-blue-800 to-blue-950 bg-linear-150 h-screen w-screen pt-[10vh]">
      <div className="max-w-4xl p-12 mx-auto text-center border rounded-lg bg-card">
        <p className="text-muted-foreground">Score: {score}</p>
        <h1 className="mb-4 text-3xl">AI Trivia Arena</h1>
        <TriviaContainer updateHack={setNewUpdateHack} />
      </div>
    </main>
  );
}

export default App;
