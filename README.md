# Visual Systems Analyst

A local chat app based on the Visual Systems Analysis LLM Systems Bible and the mural ideation directive.

To use the real LLM workflow, create a `.env` file from `.env.example` and add a rotated OpenAI key:

```txt
OPENAI_API_KEY=your_rotated_key_here
OPENAI_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-2
PORT=5174
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_BUCKET=visual-systems-assets
```

Then double-click `Launch Visual Systems Workbench.cmd` and open `http://127.0.0.1:5174`.

You can still open `index.html` directly, but direct file mode uses the built-in fallback instead of the OpenAI-powered backend.

The app includes:

- a chat-first Visual Systems Analyst experience
- natural back-and-forth concept development
- "lock this concept" as a conversational trigger for final prompt/blueprint work
- optional steering for emotional weather, satire level, class dynamics, historical echoes, fake ads, micro-scenes, living institutions, and labels
- private local backend that keeps the OpenAI key out of the browser
- optional composition sketches for central engine, institutional zones, narrative flows, and symbol matrix
- versioned protocol definitions for visual reasoning, triadic predictive history, and maximalist mural ideation
- typed artifact schemas for triadic analysis, concept directions, and image prompts
- optional Supabase-backed persistence for projects, conversations, messages, sources, protocol runs, and artifacts
- HTML source loading from local `.html` files or public URLs, with extracted text saved to Supabase when configured
- Markdown and SVG export
- local save/load fallback when Supabase has not been initialized

No install is required.

Suggested workflow:

1. Start the local server with `Launch Visual Systems Workbench.cmd`.
2. Talk to the analyst naturally. Paste source material, describe the visual problem, or ask for a concept.
3. Use optional steering only when you care about tone or visual emphasis.
4. Iterate conversationally.
5. Say `lock this concept` when you want the final prompt or structured mural blueprint.
6. Export the chat or optional sketch when useful.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the persistence tables, local prototype RLS policies, and Storage policies for the existing `visual-systems-assets` bucket.

After running the SQL:

1. Restart the local app server.
2. Open Settings.
3. Click `Sync protocols`.
4. Use `Save chat` and `Load chat` to test database persistence.

The included RLS policies are intentionally permissive for a single-user local prototype. Before sharing the app with beta users, replace them with authenticated user-scoped policies and keep source files in private buckets with signed URLs.
