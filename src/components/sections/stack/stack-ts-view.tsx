import type {StackGroup} from '@/lib/stack-groups';
import {CodeLine, Key, Keyword, Punct, Str} from './code-line';

type StackTsViewProps = {
  groups: StackGroup[];
};

/**
 * The stack as a typed TypeScript object, one line per group, formatted the way Biome would (150 columns, trailing
 * commas). It is real list markup: screen readers hear each group as a labelled list of tools, while the quotes,
 * brackets and commas that only make it look like code are hidden from them.
 */
export function StackTsView({groups}: StackTsViewProps) {
  return (
    <>
      <CodeLine n={1} syntaxOnly>
        <Keyword>export const</Keyword> stack <Punct>= {'{'}</Punct>
      </CodeLine>
      <ul className="m-0 list-none p-0">
        {groups.map((group, i) => (
          <CodeLine key={group.key} n={i + 2} as="li">
            {'  '}
            <Key hidden>{group.key}</Key>
            <Punct hidden>: [</Punct>
            <ul aria-label={group.label} className="m-0 inline list-none p-0">
              {group.tools.map((tool, j) => (
                <li key={tool} className="inline">
                  <span className="whitespace-nowrap">
                    <Str>
                      <span aria-hidden="true">'</span>
                      {tool}
                      <span aria-hidden="true">'</span>
                    </Str>
                    {j < group.tools.length - 1 ? <Punct hidden>,</Punct> : null}
                  </span>
                  {j < group.tools.length - 1 ? ' ' : null}
                </li>
              ))}
            </ul>
            <Punct hidden>],</Punct>
          </CodeLine>
        ))}
      </ul>
      <CodeLine n={groups.length + 2} syntaxOnly>
        <Punct>{'}'}</Punct> <Keyword>as const</Keyword>
        <Punct>;</Punct>
      </CodeLine>
    </>
  );
}
