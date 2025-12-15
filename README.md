
# Local Installation

## Prerequisites
- Be on an operating system that has shell (a Linux system)
- Have Node and Deno installed
- Have Docker Engine installed

## Project Setup
Run the following commands:
```sh
pnpm install
pnpm supabase init
# You'll need to wait for a bit while supabase downloads their docker images.
pnpm supabase start
# Applies migrations
pnpm supabase db reset
# Afterwards, create a `.env.local` file. Put in all the respective keys (if you need to view your supabase's keys again, run `pnpm supabase start`)
pnpm run serve-functions # in a different terminal
pnpm run dev
```

## Edge Functions
Run: `supabase secrets set --env-file .env`
I set up an import map between `./src` so that the Edge Functions can import type information.

Afterwards, duplicate the `.env.example` and rename it to `.env.local`, and change the values in it.
If you ever need to review your supabase's instance's local keys, run `pnpm supabase status`.

# Deploying to Supabase
Link your project with `pnpm supabase login` followed by `pnpm supabase link --{YOUR_PROJECT_ID}`.

When changing the database's models, run `pnpm run update-types` in the `package.json` to keep them in sync.
NOTE: You'll need to be a bash shell to run the above command.

TODO and GENERAL NOTES:
- [x] Use shadcn for the UI
- [x] Use design token system provided by shadcn
- Use Supabase Realtime instead of using response data
- Integrate retry logic into functions
- Build out dedicated functions for tasks such as getting the current score instead of deriving on UI
- Stream object data with the AI SDK
- [x] Make it look generally less horrendous
- Use a web framework like Hono instead of static files because I love scope screep
- Add a router because why not
- [x] Modify tsconfigs to have path aliases
- [x] Clean up Deno imports so it's done how Supabase + Deno recommends it to be done
- Host on Supabase + Cloudflare/Vercel/whatever
- Create Dockerfile
- Create setup script