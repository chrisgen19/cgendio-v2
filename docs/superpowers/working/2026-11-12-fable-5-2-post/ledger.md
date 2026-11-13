# SDD ledger — plan: docs/superpowers/plans/2026-11-12-fable-5-2-post.md
Spec: docs/superpowers/specs/2026-11-12-fable-5-2-post-design.md
Pre-flight: T1->T4 research-notes.md (Facts/Quotes/API) consumed by checker quote check + post: consistent.
Pre-flight: T1->T2 ## API consumed by examples: consistent.
Pre-flight: T2->T4 four example files pasted verbatim: consistent (each <=40 lines).
Pre-flight: T3->T4/T5 four webp + captions.md: consistent; T5 swaps /__fable-images/ placeholders: consistent.
Pre-flight ruling: plan commit steps say "when Christian asks"; Christian said "go ahead" to execute plan, which includes its commit steps -> commit on feature branch, no push — cost if wrong: local commits to amend/reset.
Pre-flight ruling: Task 5 is a production change; stop at Task 5 Step 1 and ask (one of the skill's four stops).
Task 1: Ruling: X posts unreachable via x.com/fxtwitter/browser; verified verbatim through publish.twitter.com oEmbed (official) — same text as the post — cost if wrong: an X quote off by a word
Task 1: Ruling: spec said Claude Code default effort Medium; API default is high (migration guide) — post states both, API default high — cost if wrong: one sentence
Task 1: complete (commits d2ef5c1..d2ef5c1, tests: bash -c 'q=$(grep -c '^- "' <scratchpad>/research-notes.md); echo quotes=$q; [ $q -ge 4 ] && ! sed -n '/^## Facts/,/^## Quotes/p' <scratchpad>/research-notes.md | grep '^- ' | grep -v 'https://'' → quotes=15)
Task 2: Ruling: tsc passed on first run, so RED was proven with a throwaway negative file (fallbacks: 'everything' -> TS2322) — cost if wrong: none
Task 2: complete (commits d2ef5c1..d2ef5c1, tests: bash -c 'cd <scratchpad>/examples && pnpm exec tsc --noEmit' → (no output))
Task 3: Ruling: hn-thread.webp is 1282px wide (2x capture of a 640px strip), not ~1600 — upscaling would blur text — cost if wrong: a smaller image
Task 3: complete (commits d2ef5c1..d2ef5c1, tests: bash -c 'cd <scratchpad>/images && test $(ls *.webp | wc -l) -eq 4 && magick identify -format '%f %w %[opaque]\n' *.webp | grep -c True | grep -qx 4 && test $(find . -name '*.webp' -size +400k | wc -l) -eq 0 && test $(wc -l < captions.md) -eq 4 && echo images-ok' → images-ok)
Task 4: Note: local pnpm db:seed inserted 5 posts (4 previously deleted locally came back) — local dev DB only — cost if wrong: re-delete in local admin
Task 4: Ruling: copied the 4 webp into public/__fable-images/ (uncommitted, removed after review) so the local review shows real images instead of broken placeholders — cost if wrong: accidentally committing them (checked before commit)
Task 4: Ruling: wrapped example code to <=88 chars for readability; at 1440px the longest lines still scroll 41-58px inside the code window (component's normal overflow-x), page overflow 0 at 1440/390 in both themes — cost if wrong: minor horizontal scroll in code
Task 4: complete (commits d2ef5c1..38a5a4d, tests: bash -c 'node <scratchpad>/check-post.mjs prisma/seed-data/posts/claude-fable-5-2-developer-guide.md <scratchpad>/research-notes.md && pnpm test --silent=passed-only' →    Duration  679ms (import 62%, tests 21%, transform 14%, worker 3%))
Final: Ruling: I1 regraded by live docs (refusals-and-fallback): mid-stream fallback CONTINUES from partial text, not a second answer; fix = mark the switch + tell client to discard partial text only when whole chain declines — cost if wrong: one paragraph
Final: Ruling: I4 checks reworded after verification: 'HTTP 200' replaced by docs wording 'normal response, not an error'; 'name the tool' claim untraceable in live docs so removed — cost if wrong: none
Final: Ruling: M1 (379 points undated) and M3 (planner silently returns [] on refusal) regraded to Important: M1 breaks the plan's Review Focus 5, M3 contradicts the post's own advice to handle refusals — cost if wrong: two small edits
Final: fixed I1 fallback switch unmarked — verify-fixes "I1 route marks fallback switch"/"discard partial text" RED→GREEN, suite 428/428
Final: fixed I2 no abort on disconnect — verify-fixes "I2" RED→GREEN, suite 428/428
Final: fixed I3 open endpoint — verify-fixes "I3" RED→GREEN, suite 428/428
Final: fixed I4 untraced claims — verify-fixes "I4" x4 RED→GREEN, suite 428/428
Final: fixed M1 (regraded) 379 points undated — RED→GREEN, suite 428/428
Final: fixed M3 (regraded) planner silent on refusal — RED→GREEN, suite 428/428
Final: Ruling: route.ts is 50 lines, over the plan's ~40, because of the review's cancel() and input cap — cost if wrong: a longer snippet
Final: minor (deferred): M2 HN alt text says 1,044 comments while body says over 1,000
Final: minor (deferred): M4 workers get only their step, not the original task
Final: minor (deferred): M5 cache comment omits the cache lifetime and write cost
Final: minor (deferred): M6 readFileSync('./docs/handbook.md') depends on cwd and output tracing
Final: minor (deferred): M7 invalid JSON body returns 500 instead of 400
Diagrams: Ruling: redrawn as 1200px portrait (model picker 1200x1572, orchestrator 1200x1300) per Christian; smallest label 8.7px at 390px, main labels 11-17px; on desktop they now take about 945px and 781px of height — cost if wrong: tall images on desktop
Final: fixed deferred minors M2, M4, M5, M6, M7 at Christian's request — tsc ok, checker OK 2596 words, suite 428/428
PR161: fixed bot findings 1-6, 8 (verify-pr.sh RED->GREEN, checker OK 2724 words, suite 428/428)
PR161: fixed Codex finding 9 (cached example throws unless end_turn) in 64113b7
PR161 CodeRabbit 64113b7: fixed 10 request.signal abort + hedged disconnect copy, 11 ZDR exception from anthropic.com/claude/fable, 12 @font-face descriptors (diagrams had rendered in system fonts; re-rendered at 1200px DSF 1 via Playwright over http, cwebp -q 85), script path quoting; skipped the Vercel maxDuration suggestion (post is host-agnostic, limits unsourced) (verify-pr.sh GREEN, checker OK 2767 words, suite 428/428)
Diagrams: Ruling: with the real fonts, Opus 5.5 highlighter resized to 0.06em past the measured text (x 92.6, w 219.7) and START HERE pill to 24px padding (w 227) — cost if wrong: small misalignment
PR161 CodeRabbit reply on 76f94a4: route passes {signal: request.signal} to the SDK (it checks signal.aborted itself, lib/BetaMessageStream.js:184-188), and the post warns that a host time limit can end a stream before the end event (host-neutral, no numbers) (verify-pr.sh GREEN, checker OK 2810 words, suite 428/428)
Task 5: uploaded launch-page, hn-thread, orchestrator, model-picker to R2 via the production admin (browsermcp); each served 200 image/webp and byte-identical; placeholders swapped in post-template.md and the post
Task 5: created the production draft (id cmwe937sh000001s132tjzdft); body read from the .md file in the page, saved 26,684 chars (the form trims the trailing newline)
Cover: Ruling: model-picker is portrait (1200x1572) and the cover frame is 16:9 object-cover, so it showed a cropped slice; per Christian, a dedicated 1600x900 cover (mockup option C, images/src/cover.html) replaced it, uploaded as images/2026/15ebd01b-63e5-4f4d-b339-471bc8aa6d7c.webp and saved on the draft; preview checked at 1440/390, light/dark — cost if wrong: one more R2 upload
