### About
This project is an image search engine built on open databases (like IQDB). It uses Node.js and Effect.

### Conventions
- Never use `any`. Use `unknown` or introduce generic type parameters instead.
- Prefer type inference; do not annotate return types unless strictly necessary.
- Inline effects directly; do not use adapters (e.g. `yield* myEffect`).
- Build pipelines with `Function.pipe`.
- Keep code visually simple: minimize indentation and nesting.

### Resources
Use the following as authoritative sources when generating code:
- Bluesky HTTP reference: https://docs.bsky.app/docs/category/http-reference
- Danbooru API wiki: https://danbooru.donmai.us/wiki_pages/help:api
- Effect Documentation for LLMs: https://effect.website/llms.txt
- IQDB README: https://raw.githubusercontent.com/danbooru/iqdb/master/README.md
