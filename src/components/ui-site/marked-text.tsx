import {Fragment} from 'react';
import {Mark} from './mark';

type MarkedTextProps = {
  /** Copy from the admin, where `[[...]]` marks the words that get the lime highlighter */
  text: string;
};

/** Renders admin copy, turning each `[[...]]` into the lime Mark. Everything else is plain text. */
export function MarkedText({text}: MarkedTextProps) {
  const parts = text.split(/\[\[(.+?)\]\]/);
  return (
    <>
      {parts.map((part, i) =>
        // Odd indexes are the captured [[...]] contents
        i % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one string never reorder
          <Mark key={i}>{part}</Mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one string never reorder
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
