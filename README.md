
# Installation
Run `pnpm install`, and then run `pnpm supabase init` followed by `pnpm supabase start`.
Afterwards, create a `.env.local` file. Put in all the respective keys (if you need to view your supabase's keys again, run `pnpm supabase start`)
Run "pnpm supabase db reset" to apply the current migrations.
To run the functions locally, run `pnpm run serve-functions`.
Finally, you can view the running app with `pnpm run dev`.

When changing the database's models, run `update-types` in the `package.json` to keep them in sync.
NOTE: You'll need to be a bash shell to run the above command.

TODO and GENERAL NOTES:
- Use shadcn for the UI
- Use design token system provided by shadcn
- Use Supabase Realtime instead of using response data
- Integrate retry logic into functions
- Build out dedicated functions for tasks such as getting the current score instead of deriving on UI
- Stream object data with the AI SDK
- Make it look generally less horrendous
- Use a web framework like Hono instead of static files because I love scope screep
- Add a router because why not
- Modify tsconfigs to have path aliases
- Clean up Deno imports so it's done how Supabase + Deno recommends it to be done
- Host on Supabase + Cloudflare/Vercel/whatever
- Create Dockerfile
- Create setup script