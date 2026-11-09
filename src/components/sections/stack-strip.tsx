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
 *
 * Under 860px the plates are no use, so the layers hang off an elevation rail instead: one line from GROUND at the
 * bottom to an arrowhead at SURFACE on top, with a numbered node per layer (see `StackLayer`). The rail shows the
 * bottom-up direction before the layers are read, which a caption under the list could not do. It is decorative
 * throughout: a screen reader gets the order from the layers' own `Layer N` labels instead.
 */
export async function StackStrip() {
  const [stack, copy] = await Promise.all([getStack(), getPageCopy()]);
  const groups = groupStack(stack.map((item) => item.name));

  return (
    <Section id="stack" className="dot-grid border-y border-line" innerClassName="flex flex-col gap-10 max-md:gap-8">
      {/* Above the list, so a plate still falling into place passes behind the heading instead of over it */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['stack.eyebrow']}</Eyebrow>
          <SectionHeading>
            The <Mark>stack</Mark>, layer by layer.
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[380px] text-base leading-[1.55] text-muted">The tools I use at each level of a site, from hosting up to design.</p>
      </div>
      <div className="relative">
        {/* The rail, phones only: a hairline from the arrowhead down to the ground bar, with a node per layer on it */}
        <div aria-hidden="true" className="absolute top-2 bottom-[17px] left-[17px] w-px bg-line md:hidden" />
        <div
          aria-hidden="true"
          className="absolute top-0 left-[11px] size-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-ink md:hidden"
        />
        {/*
         * Both endpoint labels are decorative, like the rail they annotate: the list is in DOM order bottom to top
         * (`flex-col-reverse` only flips the paint order), so a screen reader would meet "Surface" right before
         * Layer 1 and "Ground" right after Layer 5. The order they describe is already carried by the layers' own
         * `Layer N` labels and by the lede above.
         */}
        <p
          aria-hidden="true"
          className="m-0 -mt-1 mb-7 pl-[52px] font-mono text-[11px] leading-none font-medium tracking-[0.08em] text-muted uppercase md:hidden"
        >
          Surface
        </p>
        <ol id={LIST_ID} className="stack-layers m-0 flex list-none flex-col-reverse p-0 md:pt-12 md:pb-10 max-md:gap-7 max-md:pl-[52px]">
          {groups.map((group, index) => (
            <StackLayer key={group.id} group={group} index={index} />
          ))}
        </ol>
        <div aria-hidden="true" className="relative mt-7 h-[35px] md:hidden">
          <span className="absolute top-1/2 left-0 h-1 w-[35px] -translate-y-1/2 rounded-pill bg-ink" />
          <p className="absolute top-1/2 left-[52px] m-0 -translate-y-1/2 font-mono text-[11px] leading-none font-medium tracking-[0.08em] text-muted uppercase">
            Ground
          </p>
        </div>
        <StackAssembly targetId={LIST_ID} />
      </div>
    </Section>
  );
}
