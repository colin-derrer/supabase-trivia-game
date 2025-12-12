CREATE TABLE public.trivia_rounds (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  trivia_question text NOT NULL,
  answer_0 text NOT NULL,
  answer_1 text NOT NULL,
  answer_2 text NOT NULL,
  answer_3 text NOT NULL,
  explanation text NOT NULL,
  correct_answer_index smallint NOT NULL,
  selected_answer_index smallint,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT trivia_rounds_pkey PRIMARY KEY (id)
);

CREATE INDEX "trivia_rounds_created_at_idx" ON public."trivia_rounds" USING btree (created_at);

alter table public."trivia_rounds"
enable row level security;

create policy "Enable read access for all users"
on "public"."trivia_rounds"
as PERMISSIVE
for SELECT
to public
using (
  true
);