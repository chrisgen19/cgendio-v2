# Fable 5.2 post: working files

The source material behind `prisma/seed-data/posts/claude-fable-5-2-developer-guide.md` (PR #161). Spec and plan:
`docs/superpowers/specs/2026-11-12-fable-5-2-post-design.md` and `docs/superpowers/plans/2026-11-12-fable-5-2-post.md`.
`ledger.md` is the execution log, with every ruling made along the way.

| Path | What it is |
| --- | --- |
| `images/*.webp` | The 4 final images, still to be uploaded to R2 (Task 5) |
| `images/captions.md` | Alt text and caption for each image |
| `images/src/*.html` | Diagram sources (inline SVG in the site's tokens). Open one in a browser and screenshot `#diagram` to re-render it |
| `research-notes.md` | Every fact, verified quote and API detail, each with its source URL |
| `post-template.md` | The post, with `<<route.ts>>`-style placeholders for the code examples |
| `examples/` | The 4 code examples, type-checked against `@anthropic-ai/sdk` 1.8.0 and never run |
| `check-post.mjs` | Copy checker: dashes, "we/us/our", model IDs, quotes against the notes, word count |
| `verify-fixes.sh`, `verify-pr.sh` | Checks for the final-review and PR-review fixes |
| `hn-flat.mjs` | Flattens a Hacker News Algolia item into `id\|author\|text` lines, for checking quotes |

## Rule

No Claude API calls from this account, on any model. The examples are type-checked, never run.

## Commands (from the repo root)

```bash
W=docs/superpowers/working/2026-11-12-fable-5-2-post

# Type-check the examples (they sit outside the pnpm workspace)
(cd $W/examples && pnpm install --ignore-workspace && pnpm exec tsc --noEmit)

# Rebuild the post Markdown from the template and the examples
node -e "
const fs = require('fs'); const W = '$W';
const files = {'route.ts': 'examples/app/api/chat/route.ts', 'explain.ts': 'examples/explain.ts', 'cached.ts': 'examples/cached.ts', 'orchestrator.ts': 'examples/orchestrator.ts'};
let t = fs.readFileSync(W + '/post-template.md', 'utf8');
for (const [k, f] of Object.entries(files)) t = t.replace('<<' + k + '>>', '\`\`\`ts\n' + fs.readFileSync(W + '/' + f, 'utf8').trimEnd() + '\n\`\`\`');
if (/<<[^>]+>>/.test(t)) throw new Error('unreplaced placeholder');
fs.writeFileSync('prisma/seed-data/posts/claude-fable-5-2-developer-guide.md', t);
"

# Check the copy, then the review fixes
node $W/check-post.mjs prisma/seed-data/posts/claude-fable-5-2-developer-guide.md $W/research-notes.md
$W/verify-fixes.sh && $W/verify-pr.sh

# Re-download a Hacker News thread to check a quote
mkdir -p /tmp/hn && curl -sS -o /tmp/hn/50429068.json https://hn.algolia.com/api/v1/items/50429068
node $W/hn-flat.mjs /tmp/hn/50429068.json > /tmp/hn/50429068.txt
```

After Task 5 swaps in the R2 image URLs, edit `post-template.md` too, so a rebuild doesn't bring the placeholders back.
