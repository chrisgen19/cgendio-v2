import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {TimelineV6Board} from './timeline-v6-board';

const HEADING_ID = 'tl6-heading';

/**
 * Work timeline, variant 6 "Master and detail": a list of roles on the left and a dark detail panel on the right that
 * swaps when a role is picked. Under 860px the same markup becomes a stacked list where each role opens in place.
 */
export async function TimelineV6() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  return (
    <Section id="timeline" tone="white" innerClassName="flex flex-col gap-14 max-md:gap-8">
      <div data-reveal className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
          <SectionHeading id={HEADING_ID}>
            <MarkedText text={copy['timeline.heading']} />
          </SectionHeading>
        </div>
        <div className="flex max-w-[380px] flex-col items-start gap-4">
          <p className="m-0 text-base leading-[1.55] text-muted">{copy['timeline.lede']}</p>
          {/* Only once a CV is uploaded in admin Settings */}
          {settings.cvUrl ? (
            <Button href={settings.cvUrl} variant="secondary" size="sm">
              {copy['timeline.cvLabel']}
            </Button>
          ) : null}
        </div>
      </div>
      <TimelineV6Board entries={entries} labelledBy={HEADING_ID} />
    </Section>
  );
}
