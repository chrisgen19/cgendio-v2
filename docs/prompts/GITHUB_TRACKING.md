# GitHub tracking prompts — Cgdiomampo.dev

These prompts make Claude Code read `docs/BUILD_PLAN.md`, turn each phase into a GitHub issue, and keep those issues, a tracking epic and the plan's progress table in sync as you work.

| Prompt | When | What it does |
| --- | --- | --- |
| **A. Set up tracking** | Once, after the repo is on GitHub | Creates labels, a milestone, 10 phase issues and an epic, and optionally a project board. Writes `.github/tracking.json`. |
| **B. Start a phase** | Start of every phase session | Syncs the last phase, opens the phase issue, makes the branch and runs that phase's prompt |
| **C. Finish a phase** | After you've checked the work | Ticks the verified items, opens the PR with `Closes #N`, and updates the epic and progress |
| **D. Status report** | Any time | Shows where every phase stands and fixes any drift between GitHub and the plan |
| **E. Sync after editing the plan** | After you change `BUILD_PLAN.md` | Pushes the changed prompts and checklists into the issues without losing progress |

The prompts are in `~~~~` blocks. Copy everything between the fences, and replace `N` with the phase number where it appears.

---

## Before you start

1. The repo exists on GitHub and is cloned locally, with `docs/BUILD_PLAN.md` and this file committed.
2. The GitHub CLI is installed and signed in:

   ```bash
   gh auth status
   # Only if you want the project board (Prompt A asks):
   gh auth refresh -s project
   ```

3. In Claude Code, allow `gh` and `git` commands for this project (or approve them as they come up).

---

## How tracking works

- **Source of truth:** `docs/BUILD_PLAN.md`. Each phase starts with `<!-- phase:N -->` and has **Goal**, optional **Before you start**, **Prompt** and **Done when**. If an issue and the plan disagree, the plan wins.
- **Issues:** one per phase, titled `[Phase N] <title>` and labelled `build-plan` + `phase-N`. Each body has the goal, decisions, the exact prompt and the Done-when checklist, plus a hidden `<!-- build-plan:phase:N -->` marker.
- **Epic:** one issue, `Build plan: cgdiomampo.dev v1`, with a checklist that links all ten phase issues. GitHub ticks each line automatically when its issue closes. Where the repo supports sub-issues, the phases are attached as sub-issues too.
- **Milestone:** `v1 launch`, holding every phase issue.
- **Project board (optional):** `Cgdiomampo.dev v1`, with the built-in Status field (Todo · In Progress · Done).
- **State file:** `.github/tracking.json` remembers the issue numbers, the project IDs and each phase's branch, PR and status, so later prompts never have to search.
- **Status flow:** `Not started` → `In progress` (Prompt B) → `In review` (Prompt C, PR open) → `Done` (when the PR merges and the issue closes; recorded by the next Prompt B or by Prompt D).
- **Branches and PRs:** branch `feature/phase-N-short-name`, conventional commits, a PR title like `feat(phase-N): <short title>`, and a PR body containing `Closes #<issue>`, so merging closes the issue.
- **Progress log:** Claude Code adds dated comments to the phase issue at start, at each decision and at finish. It never rewrites history.

`.github/tracking.json` looks like this:

```json
{
  "repo": "owner/name",
  "milestone": "v1 launch",
  "epic": 1,
  "project": { "number": 3, "id": "PVT_xxx", "statusFieldId": "PVTSSF_xxx", "options": { "Todo": "xxx", "In Progress": "xxx", "Done": "xxx" } },
  "phases": {
    "0": { "issue": 2, "title": "Kickoff: project rules", "branch": null, "pr": null, "status": "Not started", "projectItemId": "PVTI_xxx" }
  }
}
```

`project` is `null` if you skip the board.

---

## A. Set up tracking (run once)

~~~~text
Set up GitHub tracking for docs/BUILD_PLAN.md. Follow docs/prompts/GITHUB_TRACKING.md ("How tracking works") exactly. Use the gh CLI for everything. Be idempotent: re-running this must never create duplicates.

0. Preflight
   - Run `gh auth status` and `gh repo view --json nameWithOwner,defaultBranchRef,hasIssuesEnabled`. Stop and tell me if gh isn't authenticated or issues are disabled.
   - If .github/tracking.json already exists, read it and only fill in what's missing.
   - Ask me one question before writing anything: "Create a GitHub Project board too? (needs the `project` scope)".

1. Parse docs/BUILD_PLAN.md
   - Split on the `<!-- phase:N -->` markers (N = 0..9). For each phase capture: title (the text after "Phase N — " in its heading), Goal, Before you start (if any), the Prompt code block verbatim, and the Done when checklist items verbatim.
   - Show me a dry-run table: phase · issue title · number of checklist items · whether it has decisions. Then list every label, milestone, issue and board you will create (marking which already exist). WAIT for my "go".

2. Labels (create with --force so re-runs just update):
   - build-plan (#0D0E12) "Tracked from docs/BUILD_PLAN.md"
   - epic (#3B2BFF) "Build plan epic"
   - phase-0 … phase-9 (#D7FF3D) "Build plan phase N"
   - needs-decision (#C2410C) "Waiting on a choice from Christian"
   - blocked (#B91C1C) "Can't proceed"

3. Milestone "v1 launch" (description: "cgdiomampo.dev live on Coolify") via
   `gh api repos/{owner}/{repo}/milestones` — reuse it if one with that title exists (check `gh api repos/{owner}/{repo}/milestones?state=all`).

4. Phase issues, in order 0..9. Before creating each, look for an existing one: tracking.json first, then
   `gh issue list --state all --label phase-N --label build-plan --json number,title`. Reuse if found.
   Title: [Phase N] <title>
   Labels: build-plan, phase-N, plus needs-decision for phases whose section has "Before you start" with a choice (4 and 5).
   Milestone: v1 launch
   Body (write to a temp file and use --body-file; keep the prompt and checklist verbatim):

   <!-- build-plan:phase:N -->
   > Generated from `docs/BUILD_PLAN.md` § Phase N. The plan is the source of truth — edit the plan, then run Prompt E to sync.

   ## Goal
   <goal>

   ## Before you start
   <decisions as a checklist, e.g. "- [ ] Decide: database host (Postgres in Coolify on the Hostinger VPS, or Neon)" — omit this section if none>

   ## Claude Code prompt
   ```text
   <the phase prompt, verbatim>
   ```

   ## Done when
   <the Done when checklist, verbatim, as - [ ] items>

   ## Workflow
   - Start: Prompt B in docs/prompts/GITHUB_TRACKING.md
   - Branch: `feature/phase-N-<short-name>`
   - Finish: Prompt C — PR must say `Closes #<this issue>`

5. Epic issue "Build plan: cgdiomampo.dev v1" (labels build-plan, epic; milestone v1 launch). Body:
   - One-line purpose and a link to docs/BUILD_PLAN.md
   - "## Phases" — a task list, one line per phase: `- [ ] #<issue> Phase N: <title>` (GitHub ticks these automatically as issues close)
   - "## Open items before launch" — copy the plan's "Open items to fill before launch" checklist
   Then try to attach each phase issue as a sub-issue of the epic:
   `gh api -X POST repos/{owner}/{repo}/issues/<epic>/sub_issues -F sub_issue_id=<phase issue id>`
   where <phase issue id> is `gh api repos/{owner}/{repo}/issues/<number> --jq .id` (the numeric id, not the number). If the API isn't available, skip silently — the task list is enough. Ignore "already a sub-issue" errors.

6. Project board — only if I said yes in step 0:
   - Create or reuse a project titled "Cgdiomampo.dev v1" for the repo owner (`gh project list --owner <owner> --format json`, then `gh project create --owner <owner> --title ... --format json`), and link it to the repo (`gh project link`).
   - Read the Status field id and its option ids with `gh project field-list <number> --owner <owner> --format json` and the project node id with `gh project view <number> --owner <owner> --format json`.
   - Add the epic and every phase issue (`gh project item-add ... --url <issue url> --format json`), store each item id, and set every phase to Todo with `gh project item-edit --id <item> --project-id <project id> --field-id <status field> --single-select-option-id <Todo>`.

7. Write .github/tracking.json (shape in docs/prompts/GITHUB_TRACKING.md; every phase status "Not started"). Fill the Issue column of the Progress table in docs/BUILD_PLAN.md with `#<number>` links. Change nothing else in the plan.

8. Commit `.github/tracking.json` and the plan's table on a branch `chore/project-tracking` and open a PR titled "chore: set up build-plan tracking". If the repo has no commits on the default branch yet, ask me whether to commit straight to it instead.

9. Report: a table of phase · issue link · labels · board status, the epic link, the board link (if any), and anything you skipped or reused.
~~~~

---

## B. Start a phase

Replace `N` with the phase number (for example, `Start Phase 3`).

~~~~text
Start Phase N of docs/BUILD_PLAN.md. Follow CLAUDE.md and docs/prompts/GITHUB_TRACKING.md.

1. Sync first
   - Read .github/tracking.json. If it's missing, stop and tell me to run Prompt A.
   - Run `git fetch` and switch to an up-to-date default branch.
   - For every phase marked "In review" in tracking.json, check its PR (`gh pr view <pr> --json state,mergedAt`). If merged: set status "Done" in tracking.json and the plan's Progress table, set the board item to Done (if a board exists), and confirm the issue is closed (close it with a comment linking the PR if it isn't).
   - Warn me (but don't stop) if an earlier phase isn't Done yet.

2. Load the phase
   - Read the Phase N section of docs/BUILD_PLAN.md and the issue (`gh issue view <issue> --comments`). If the issue's prompt or checklist differs from the plan, the plan wins — tell me and suggest running Prompt E afterwards.
   - If the issue has a "Before you start" checklist with unticked decisions, ask me those questions now. When I answer, tick them in the issue body, add a comment "Decision: <answer>", and remove the needs-decision label.

3. Mark it started
   - Create branch `feature/phase-N-<short-name>` from the default branch (kebab-case from the phase title, max ~4 words). If it already exists, check it out and continue.
   - Set status "In progress" in tracking.json (with the branch name) and in the Progress table; set the board item to In Progress.
   - Comment on the issue: "Started <YYYY-MM-DD> on branch `<branch>`."
   - Commit these tracking updates as `chore(tracking): start phase N`.

4. Do the work
   - Execute the phase prompt from docs/BUILD_PLAN.md exactly, in plan mode: present the plan, wait for my approval, then build.
   - Commit in small conventional commits as you go. If something in the prompt can't be done, or I change scope, add an issue comment explaining it.
   - When the prompt's own verification passes, STOP. Summarise what you built, list each Done-when item with your evidence (command output, routes, screenshots you checked), and tell me what I should check in the browser myself. Don't open the PR — that's Prompt C, after I've looked.
~~~~

---

## C. Finish a phase

~~~~text
Finish Phase N of docs/BUILD_PLAN.md. Follow CLAUDE.md and docs/prompts/GITHUB_TRACKING.md.

1. Verify
   - Make sure you're on the phase branch with a clean tree. Run pnpm typecheck, pnpm lint, pnpm build (and the tests, from Phase 8 on). Stop and fix anything that fails.
   - Go through the issue's Done-when checklist one item at a time. For each, say "verified" with evidence or "not verified" with the reason. Ask me to confirm the items that need my eyes (visual match, browser checks). Never tick an item that isn't verified.

2. Update the issue
   - Tick exactly the verified items in the issue body (edit the body with --body-file; leave everything else unchanged).
   - Comment a short summary: what changed, key files, decisions made, anything deferred (link a new issue for each deferred item, labelled build-plan + phase-N).

3. Update tracking
   - Set status "In review" in .github/tracking.json and in the Progress table; leave the board at In Progress.
   - Commit as `chore(tracking): phase N in review`.

4. Open the PR
   - Push the branch and run `gh pr create` with title `<type>(phase-N): <short lowercase title>` (feat for features, chore for setup), e.g. `feat(phase-1): scaffold and design foundations`; labels build-plan + phase-N, milestone v1 launch.
   - PR body: summary, a checklist of the Done-when items (ticked to match the issue), screenshots or notes for the 1440px and 390px checks, how to test, and the line `Closes #<issue>`.
   - Put the PR number and URL in tracking.json and the Progress table's PR column, then commit and push that change too.

5. Report: the PR link, any unticked items, and anything I should review before merging. If every Done-when item is ticked, say the phase is ready to merge; otherwise say what's missing.
~~~~

---

## D. Status report and resync

~~~~text
Give me a status report on the build plan and fix any drift. Follow docs/prompts/GITHUB_TRACKING.md.

1. Read .github/tracking.json, the Progress table in docs/BUILD_PLAN.md, every phase issue (state, ticked/total Done-when items, labels, last comment date), each phase PR (state, merged, checks), and the board statuses if a board exists.
2. Work out the true status of each phase: Done = PR merged and issue closed; In review = PR open; In progress = branch exists or the issue has a "Started" comment; otherwise Not started.
3. Show me one table: Phase · Issue · Status · Done-when (ticked/total) · PR · CI · Blockers/decisions pending. Under it list: the next phase to start, open needs-decision items, and the epic's "Open items before launch" still unticked.
4. List every mismatch between tracking.json, the Progress table, the issues and the board. Ask me before fixing them; then fix them, commit as `chore(tracking): resync` on a branch, and open a small PR.
~~~~

---

## E. Sync after editing the plan

~~~~text
I've edited docs/BUILD_PLAN.md. Sync the phase issues to it without losing progress. Follow docs/prompts/GITHUB_TRACKING.md.

1. Re-parse every `<!-- phase:N -->` section. For each phase issue, compare Goal, Before you start, the prompt and the Done-when items with the issue body.
2. Show me a per-phase diff summary (changed prompt? items added/removed/reworded?) and WAIT for my "go".
3. Rewrite only the changed sections of each issue body. Keep the hidden marker and the Workflow section. For the Done-when and Before-you-start checklists, keep an item's ticked state when its text still matches (ignore whitespace and punctuation); new items start unticked; removed items are dropped and listed in an issue comment ("Removed from plan: …").
4. If a phase was added or removed, create or close its issue (close with a comment, don't delete), and update the epic task list, the board and .github/tracking.json.
5. Commit any tracking.json changes as `chore(tracking): sync with plan` and report what changed.
~~~~

---

## Optional: close phases automatically on merge

`Closes #N` in the PR body already closes the issue on merge, and the epic's task list ticks itself. The plan's Progress table catches up the next time you run Prompt B or D. If you'd rather have it update the moment a PR merges, ask Claude Code:

~~~~text
Add a GitHub Actions workflow .github/workflows/build-plan-progress.yml that runs when a pull request labelled build-plan is merged into the default branch. It should read .github/tracking.json, find the phase whose pr matches, set its status to "Done" in tracking.json and in the Progress table in docs/BUILD_PLAN.md, and commit the change with the github-actions bot as `chore(tracking): phase N done [skip ci]`. Use only the built-in GITHUB_TOKEN with contents: write, and make it a no-op if nothing changes. Explain how it interacts with branch protection before adding it.
~~~~
