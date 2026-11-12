#!/bin/bash
# One assertion per PR #161 bot finding being fixed; exits 1 if any fail
P="$(cd "$(dirname "$0")" && pwd)"
R=$P/examples/app/api/chat/route.ts; O=$P/examples/orchestrator.ts; C=$P/examples/cached.ts; T=$P/post-template.md; N=$P/research-notes.md
f=0; check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; f=1; fi; }
check "1 Bedrock ID in post"                  "grep -q 'global.anthropic.claude-fable-5-2' $T"
check "1 Bedrock ID sourced in notes"         "grep -q 'global.anthropic.claude-fable-5-2' $N"
check "1 no blanket 'AWS' claim"              "! grep -q 'Claude Platform, AWS, Google Cloud' $T"
check "2 workers checked for end_turn"        "grep -q \"stop_reason !== 'end_turn'\" $O"
check "3 step count bounded before dispatch"  "grep -q 'steps.length > 8' $O"
check "4 route reports stop reason at end"    "grep -q \"type: 'end'\" $R && grep -q 'stopReason: final.stop_reason' $R"
check "4 prose names truncation reasons"      "grep -q 'model_context_window_exceeded' $T"
check "5 route streams NDJSON"                "grep -q 'application/x-ndjson' $R && grep -q 'JSON.stringify(event)' $R"
check "5 no literal marker strings"           "! grep -q '\[Declined\]\|\[Switched model\]' $R"
check "6 guard described as input-only"       "grep -q 'not a cost cap' $C && grep -q 'only counts input' $T"
check "8 prose says workers only see text"    "grep -q 'only see text' $T"
check "tsc passes"                            "(cd $P/examples && pnpm exec tsc --noEmit)"
exit $f
