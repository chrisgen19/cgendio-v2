import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {countTools, groupStack} from '@/lib/stack-groups';
import {getPageCopy, getStack} from '@/server/content';
import {StackJsonView} from './stack/stack-json-view';
import {StackTsView} from './stack/stack-ts-view';
import {StackWindow} from './stack/stack-window';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * "The manifest": the stack written the way we would declare it in a project, as a typed object grouped by the layer
 * each tool serves. A split band under the hero: eyebrow and a one-line heading on the left, the code window on the right.
 */
export async function StackStrip() {
  const [stack, copy] = await Promise.all([getStack(), getPageCopy()]);
  const groups = groupStack(stack.map((item) => item.name));
  const summary = `${plural(countTools(groups), 'tool')} in ${plural(groups.length, 'group')}`;
  return (
    <section aria-labelledby="stack-heading" className="border-b border-line bg-white px-14 py-20 max-md:px-5 max-md:py-14">
      <div className="mx-auto grid max-w-site items-start gap-x-16 gap-y-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="md:pt-12">
          <Eyebrow>{copy['stack.eyebrow']}</Eyebrow>
          <h2
            id="stack-heading"
            className="mt-5 mb-0 font-display text-[clamp(32px,3.4vw,50px)] leading-[1.02] font-bold tracking-[-0.04em] text-balance"
          >
            Every tool, sorted by the <Mark>layer</Mark> it serves.
          </h2>
        </div>
        <StackWindow ts={<StackTsView groups={groups} />} json={<StackJsonView groups={groups} />} summary={summary} />
      </div>
    </section>
  );
}
