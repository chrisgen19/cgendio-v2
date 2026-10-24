import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type CodeLineProps = {
  /** The line number in the gutter (decorative, never selected or read out) */
  n: number;
  as?: 'div' | 'li';
  /** Hides a pure-syntax line (braces, declarations) from screen readers; the list lines stay readable. */
  syntaxOnly?: boolean;
  /** An optional gutter decoration after the number, such as a logo */
  gutter?: ReactNode;
  children: ReactNode;
};

/**
 * One line of a code view. Long lines soft-wrap like an editor with word wrap on: the first row starts at the line's own
 * indent and the rest hang 4ch in, so phones never scroll sideways. The text span is what the typing intro clips, and
 * the empty anchor at its end tells the caret where the line stops.
 */
export function CodeLine({n, as: Tag = 'div', syntaxOnly, gutter, children}: CodeLineProps) {
  return (
    <Tag data-code-line="" aria-hidden={syntaxOnly || undefined} className="flex gap-x-4 max-md:gap-x-3">
      <span aria-hidden="true" className="flex shrink-0 items-center gap-x-3 self-start text-code-dim/55 select-none">
        <span className="w-[2ch] text-right tabular-nums">{n}</span>
        {gutter}
      </span>
      <span
        data-line-text=""
        className={cn(
          'inline-block max-w-full min-w-0 -indent-[4ch] pl-[4ch] whitespace-pre-wrap',
          // Hidden while the intro waits for the window to scroll into view (the window sets data-armed)
          'group-data-armed/code:[clip-path:inset(0_100%_0_0)]',
        )}
      >
        {children}
        <span data-caret-anchor="" />
      </span>
    </Tag>
  );
}

type TokenProps = {children: ReactNode; hidden?: boolean};

const token = (className: string) =>
  function Token({children, hidden}: TokenProps) {
    return (
      <span aria-hidden={hidden || undefined} className={className}>
        {children}
      </span>
    );
  };

/** Syntax colours from the code tokens, the same palette the blog's code blocks use */
export const Keyword = token('text-code-keyword');
export const Str = token('text-code-string');
export const Key = token('text-code-tag');
export const Punct = token('text-code-dim');
