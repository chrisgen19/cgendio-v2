#!/bin/bash
# One assertion per final-review fix; prints FAIL lines and exits 1 if any fail
P="$(cd "$(dirname "$0")" && pwd)"
R=$P/examples/app/api/chat/route.ts; O=$P/examples/orchestrator.ts; T=$P/post-template.md; N=$P/research-notes.md
f=0; check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; f=1; fi; }
check "I1 route marks fallback switch"        "grep -q \"content_block.type === 'fallback'\" \"$R\""
check "I1 prose explains the fallback marker" "grep -q 'fallback marker\|marks the switch' \"$T\""
check "I2 route aborts on client disconnect"  "grep -q 'stream.abort()' \"$R\" && grep -q 'cancel()' \"$R\""
check "I3 route caps input size"              "grep -q '413' \"$R\""
check "I3 prose says to add auth"             "grep -qi 'auth' \"$T\""
check "I4 no 'The same limits'"               "! grep -q 'The same limits' \"$T\""
check "I4 notes source 'most of the gain'"    "grep -q 'most of the capability gain' \"$N\""
check "I4 refusal wording sourced"     "grep -q 'normal response, not an error' \"$N\" && ! grep -q 'HTTP 200' \"$T\""
check "I4 untraced tool-naming claim removed"       "! grep -q 'name the tool' \"$T\""
check "M1 379 points dated"                   "! grep -q '(379 points)' \"$T\""
check "M3 planner throws on no plan"          "grep -q 'No plan returned' \"$O\""
check "I1 prose says discard partial text" "grep -q 'discard the partial text' \"$T\""
check "tsc passes"                            "(cd \"$P/examples\" && pnpm exec tsc --noEmit)"
exit $f
