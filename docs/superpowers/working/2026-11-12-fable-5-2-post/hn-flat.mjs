// Flattens an HN Algolia item tree into "id|author|text" lines with HTML stripped
import {readFileSync} from 'node:fs';

const root = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const decode = (s) =>
  s
    .replace(/<p>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');
console.log(`ROOT|${root.title}|points=${root.points}|url=${root.url}`);
const walk = (n) => {
  if (n.text) console.log(`${n.id}|${n.author}|${decode(n.text)}`);
  (n.children || []).forEach(walk);
};
(root.children || []).forEach(walk);
