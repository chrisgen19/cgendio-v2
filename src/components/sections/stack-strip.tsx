import {ArrowUp} from 'lucide-react';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {groupStack} from '@/lib/stack-groups';
import {getPageCopy, getStack} from '@/server/content';
import {StackAssembly} from './stack/stack-assembly';
import {StackLayer} from './stack/stack-layer';

const LIST_ID = 'stack-layers';

/**
 * "The layered stack": the tools grouped into the layers of a site, drawn as plates stacked bottom (hosting) to top
 * (design) on the dot grid. The list is server-rendered in that order; CSS stacks it upwards and, on desktop, drops
 * the plates into place as the section scrolls into view.
 */
export async function StackStrip() {
  const [stack, copy] = await Promise.all([getStack(), getPageCopy()]);
  const groups = groupStack(stack.map((item) => item.name));

  return (
    <Section id="stack" className="dot-grid border-y border-line" innerClassName="flex flex-col gap-10 max-md:gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['stack.eyebrow']}</Eyebrow>
          <SectionHeading>
            Built layer by <Mark>layer.</Mark>
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[380px] text-base leading-[1.55] text-muted">The tools we use at each level of a site, from hosting up to design.</p>
      </div>
      <div>
        <ol id={LIST_ID} className="stack-layers m-0 flex list-none flex-col-reverse p-0 md:pt-12 md:pb-10 max-md:gap-2.5">
          {groups.map((group, index) => (
            <StackLayer key={group.id} group={group} index={index} />
          ))}
        </ol>
        <p className="m-0 mt-5 flex items-center gap-2 font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase md:hidden">
          <ArrowUp aria-hidden="true" className="size-4" />
          From the ground up
        </p>
        <StackAssembly targetId={LIST_ID} />
      </div>
    </Section>
  );
}
