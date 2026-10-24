import type {StackGroup} from '@/lib/stack-groups';
import {getStackIconPath} from '@/lib/stack-icons';
import {CodeLine, Key, Punct, Str} from './code-line';

type StackJsonViewProps = {
  groups: StackGroup[];
};

/** A monochrome logo for the gutter; Builder.io (no Simple Icons logo) and new names get a lettered square instead. */
function GutterLogo({name}: {name?: string}) {
  if (!name) return <span className="size-3.5 shrink-0" />;
  const path = getStackIconPath(name);
  if (!path) {
    return (
      <span className="grid size-3.5 shrink-0 place-items-center rounded-[3px] border border-current text-code-dim text-[8px] leading-none font-semibold">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current text-code-dim" focusable="false">
      <path d={path} />
    </svg>
  );
}

/** The flat view: every tool on its own line with the group it belongs to, like a dependency list. */
export function StackJsonView({groups}: StackJsonViewProps) {
  const rows = groups.flatMap((group) => group.tools.map((tool) => ({tool, label: group.label})));
  return (
    <>
      <CodeLine n={1} syntaxOnly gutter={<GutterLogo />}>
        <Punct>{'{'}</Punct>
      </CodeLine>
      <ul className="m-0 list-none p-0">
        {rows.map((row, i) => (
          <CodeLine key={row.tool} n={i + 2} as="li" gutter={<GutterLogo name={row.tool} />}>
            {'  '}
            <span className="whitespace-nowrap">
              <Key>
                <span aria-hidden="true">"</span>
                {row.tool}
                <span aria-hidden="true">"</span>
              </Key>
              <Punct hidden>:</Punct>
            </span>{' '}
            <span className="whitespace-nowrap">
              <Str>
                <span aria-hidden="true">"</span>
                {row.label}
                <span aria-hidden="true">"</span>
              </Str>
              {i < rows.length - 1 ? <Punct hidden>,</Punct> : null}
            </span>
          </CodeLine>
        ))}
      </ul>
      <CodeLine n={rows.length + 2} syntaxOnly gutter={<GutterLogo />}>
        <Punct>{'}'}</Punct>
      </CodeLine>
    </>
  );
}
