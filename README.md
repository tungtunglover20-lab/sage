# D&D Sage

An AI-powered Discord bot that answers Dungeons & Dragons 5th Edition rules
questions by retrieving relevant passages from your own indexed rulebook
PDFs and generating a source-cited answer — it never guesses from memory
alone when a rules citation is available.

## Status

This project is being built one subsystem at a time. **Subsystem 1** (this
delivery) sets up the application foundation and a working bot skeleton with
a `/ping` smoke-test command. Retrieval, indexing, and the rules-specific
commands (`/ask`, `/search`, `/spell`, etc.) land in later subsystems — see
[Roadmap](#roadmap) below.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN`,
   `DISCORD_CLIENT_ID`, and `OPENROUTER_API_KEY`. While developing, also set
   `DISCORD_GUILD_ID` to your test server's ID — guild-scoped commands update
   instantly, global ones can take up to an hour to propagate.
3. `npm run deploy` to register the slash commands with Discord.
4. `npm start` (or `npm run dev` to auto-restart on file changes).

You should see D&D Sage come online in the console and its status change in
Discord. Run `/ping` in your server to confirm the whole pipeline —
gateway connection, command registration, and interaction handling — works
end to end.

## Design decisions made so far

**AI model.** `google/gemma-4-26b-a4b-it` was verified against OpenRouter's
live model list before wiring it in — it's a real, currently available
Gemma 4 mixture-of-experts model — so it's used exactly as specified.

**Embeddings.** OpenRouter now exposes a dedicated, OpenAI-compatible
`/v1/embeddings` endpoint. Rather than adding a second AI provider just for
embeddings, D&D Sage will generate them through OpenRouter as well, so the
whole AI stack shares one API key. The default is
`openai/text-embedding-3-small`, controlled by `OPENROUTER_EMBEDDING_MODEL`
so it can be swapped without touching code.

**Vector database.** The brief asked for ChromaDB if practical, with
permission to explain a substitution otherwise. Chroma's official Node
client is a thin REST client — it talks to a Chroma *server*, which today
means running a separate, long-lived Python process. A Pterodactyl server is
normally defined by one startup command (`node src/index.js`), with no
guarantee Python is available in the image, no process supervision for a
second background service, and no guaranteed spare port allocation. Requiring
an external Chroma server would turn a "drop it on Pterodactyl and go" bot
into a two-service deployment the user has to babysit and keep alive
alongside the bot.

So the indexing subsystem will use an embedded, pure-JS, file-based vector
store (**Vectra**) that lives entirely inside the Node process and persists
to `/embeddings` — no second service, no native compilation step, nothing
beyond `npm install`. It sits behind a `VectorStoreService` interface, so a
real Chroma server (or any other backend) can be swapped in later purely
through configuration, on setups that can support a second service.

## Roadmap

- [x] 1. Project foundation & bot bootstrap (`/ping`)
- [ ] 2. PDF ingestion & chunking
- [ ] 3. Embedding generation & vector store service
- [ ] 4. OpenRouter AI provider service
- [ ] 5. `/ask` retrieval-augmented answer pipeline
- [ ] 6. `/index`, `/search`, `/help`
- [ ] 7. `/spell`, `/monster`, `/item`, `/class`, `/subclass`, `/feat`, `/background`, `/condition`
- [ ] 8. Pagination, polish, final README

## Project structure

```text
dnd-sage/
├── books/                  # Drop your rulebook PDFs here (not committed to git)
├── embeddings/             # Generated vector index (not committed to git)
├── database/               # Reserved for future structured data (campaigns, characters, ...)
├── src/
│   ├── ai/                 # OpenRouter provider abstraction (subsystem 4)
│   ├── commands/            # One file per slash command
│   ├── config/
│   │   └── env.js          # Validates and exposes environment configuration
│   ├── events/              # Discord client event handlers
│   ├── indexing/            # PDF scanning, text extraction, chunking (subsystem 2)
│   ├── services/            # Reusable services (command/event loaders, vector store, ...)
│   ├── utils/                # Logger, error classes, cooldowns, embed helpers
│   ├── deploy-commands.js   # Registers slash commands with Discord
│   └── index.js             # Application entry point
├── package.json
├── .env.example
└── README.md
```

## Architecture notes for future subsystems

- **AI provider is abstracted.** `src/ai/` will expose a provider-agnostic
  interface; OpenRouter is the only implementation today, and the model name
  is entirely configuration-driven, so swapping models or providers later
  won't touch command code.
- **Commands and events are auto-discovered.** Dropping a new file into
  `src/commands/` or `src/events/` is enough — `commandLoader.js` and
  `eventLoader.js` pick it up with no manual registration.
- **Error handling is centralized.** Commands throw a `CommandError` (from
  `src/utils/errors.js`) for anything the user should see a specific message
  about; `interactionCreate.js` is the single place that turns any thrown
  error into a Discord response and a log line.
