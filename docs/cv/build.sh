#!/usr/bin/env bash
# Render docs/cv/cv.html to two text-based PDFs with headless Chrome:
#   A4     + UK spelling  -> Australian clients
#   Letter + US spelling  -> US clients
# cv.html is the single source, written as A4 would read it (UK spelling) but
# sized Letter; each build applies one transform, so the two can never drift.
# Usage: docs/cv/build.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="Christian-Diomampo-Senior-Full-Stack-Developer-CV"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

render() {
  local src="$1" out="$2"
  "$CHROME" \
    --headless \
    --disable-gpu \
    --no-pdf-header-footer \
    --print-to-pdf="$out" \
    "file://$src"
  echo "Wrote $out"
}

# 1. A4, UK spelling: page size only.
sed -e 's/size: letter;/size: A4;/' "$DIR/cv.html" >"$WORK/cv-a4-uk.html"
render "$WORK/cv-a4-uk.html" "$DIR/$BASE-A4-UK-spelling.pdf"

# 2. Letter, US spelling: spelling only.
# Keep this list in step with any new British spelling added to cv.html.
sed \
  -e 's/optimis/optimiz/g' \
  -e 's/customiser/customizer/g' \
  -e 's/jewellery/jewelry/g' \
  "$DIR/cv.html" >"$WORK/cv-letter-us.html"
render "$WORK/cv-letter-us.html" "$DIR/$BASE-Letter-US-spelling.pdf"
