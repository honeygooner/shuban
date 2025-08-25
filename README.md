# shuban (集番)

### overview
shuban is an image search engine that maps images on the web to tagged posts on image boards. it exposes a simple api for building things like:
- alternative image board front-ends, built on atproto
- bluesky custom feeds, labelers, and lists

**how it works**
1. images on the web are mapped to posts on image boards
2. mappings are indexed in a searchable database
3. developers can query an api to search the database

> [!NOTE]
> bluesky and danbooru were initially chosen for their extensive and open api (other platforms may be supported in the future since iqdb supports several other image boards)

### roadmap
- [ ] danbooru + bluesky
- [ ] api endpoints for search
- [ ] platform hardening

### stack
observability, speed, and resilience are crucial to make this project production-ready
- [effect](https://effect.website/)
- [node.js](https://nodejs.org/) <!-- may swap for a faster runtime -->
- [typescript](https://www.typescriptlang.org/)

> [!NOTE]
> originally, golang was explored as an option for this project's stack, but it fell short of the batteries-included nature of effect (plus I'm just not as familiar with golang)
