// Checks a post's Markdown against the copy rules for the Fable 5.2 post.
// Usage: node check-post.mjs <post.md> <research-notes.md>. Exits 1 and lists every failure.
import {readFileSync} from 'node:fs';

const [mdPath, notesPath] = process.argv.slice(2);
const md = readFileSync(mdPath, 'utf8');
const notes = readFileSync(notesPath, 'utf8');
const failures = [];

const ALLOWED_IDS = new Set(['claude-fable-5-2', 'claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5']);

// Prose is everything outside fenced code; code comments count as prose for the voice rule
const fences = [...md.matchAll(/```[^\n]*\n([\s\S]*?)```/g)];
const prose = md.replace(/```[^\n]*\n[\s\S]*?```/g, '');
const comments = fences.flatMap((m) => m[1].split('\n').filter((l) => l.trim().startsWith('//')));
const proseNoCode = prose.replace(/`[^`]*`/g, '');
const voiceText = [proseNoCode.replace(/\]\([^)]*\)/g, ']'), ...comments].join('\n');

if (/[—–]/.test(md)) failures.push('contains an em or en dash');

const voice = voiceText.match(/\b(we|we're|we've|us|our|ours)\b/gi);
if (voice) failures.push(`first-person plural: ${[...new Set(voice)].join(', ')}`);

for (const m of md.matchAll(/!\[([^\]]*)\]\(/g)) if (!m[1].trim()) failures.push('image with empty alt text');

for (const m of md.matchAll(/claude-[a-z]+(?:-\d+)+/g)) {
  if (!ALLOWED_IDS.has(m[0])) failures.push(`model ID not allowed: ${m[0]}`);
}

const quoteSection = notes.split('## Quotes')[1]?.split('## API')[0] ?? '';
const norm = (s) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[.,]+$/, '')
    .trim();
for (const m of proseNoCode.matchAll(/["“]([^"”\n]{21,})["”]/g)) {
  if (!norm(quoteSection).includes(norm(m[1]))) failures.push(`quote not in notes: "${m[1].slice(0, 60)}"`);
}

if (/\bpoints\b/.test(proseNoCode) && !/at the time of writing/.test(proseNoCode)) {
  failures.push('mentions points without "at the time of writing"');
}
if (!/^## Sources/m.test(md)) failures.push('missing ## Sources');
if ((md.match(/reddit/gi) ?? []).length > 1) failures.push('mentions Reddit more than once');

const words = proseNoCode
  .replace(/\]\([^)]*\)/g, ']')
  .replace(/[#>*_|![\]-]/g, ' ')
  .split(/\s+/)
  .filter(Boolean).length;
if (words < 2300 || words > 3200) failures.push(`prose word count ${words} outside 2300 to 3200`);

if (failures.length) {
  console.log(`FAIL (${failures.length})\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: ${words} words, ${fences.length} code blocks`);
