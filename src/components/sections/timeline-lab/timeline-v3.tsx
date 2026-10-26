import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {TimelineV3Ledger} from './timeline-v3-ledger';

/**
 * Work timeline, variant 3 "Expanding ledger": the intro sits above a full-width, statement-style ledger (when, role,
 * organisation) whose rows open in place to show the description. The current role starts open.
 */
export async function TimelineV3() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  return (
    <Section id="timeline" tone="white" innerClassName="flex flex-col gap-12 max-md:gap-8">
      {/* The intro sits on the ledger's own columns: the heading over No. to Role, the lede over Organisation */}
      <div data-reveal className="tlv3-intro">
        <div className="-ml-4 flex flex-col gap-[18px] [grid-area:head] max-md:ml-0">
          <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
          <SectionHeading>
            <MarkedText text={copy['timeline.heading']} />
          </SectionHeading>
        </div>
        <div className="flex flex-col items-start gap-5 [grid-area:lede]">
          <p className="m-0 max-w-[360px] text-base leading-[1.55] text-muted">{copy['timeline.lede']}</p>
          {/* Only once a CV is uploaded in admin Settings */}
          {settings.cvUrl ? (
            <Button href={settings.cvUrl} variant="secondary" size="sm">
              {copy['timeline.cvLabel']}
            </Button>
          ) : null}
        </div>
      </div>
      <TimelineV3Ledger entries={entries} />
    </Section>
  );
}
