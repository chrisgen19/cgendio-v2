import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings} from '@/server/content';
import {AboutCanvas} from './about/about-canvas';
import {AboutInspect} from './about/about-inspect';
import {AboutStage} from './about/about-stage';
import {aboutCopy} from './about/copy';

/**
 * "Inspect canvas": the studio takes brands from research and Figma to live sites, so the About shows Christian the way
 * a designer sees a frame. The portrait is a selected frame on the dot grid with comment pins on it, and the inspect
 * panel beside it lists the facts. The panel is the content; the canvas around the photo is decoration.
 */
export async function About() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);
  const r2 = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  const optimizable = Boolean(r2 && settings.photoUrl?.startsWith(`${r2}/`));
  const about = aboutCopy(copy);

  return (
    <Section id="about" innerClassName="flex flex-col gap-12 max-md:gap-8">
      <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['about.eyebrow']}</Eyebrow>
          <SectionHeading>
            <MarkedText text={about.heading} />
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[480px] text-lg leading-[1.55] text-muted max-md:text-base">{about.intro}</p>
      </div>
      <AboutStage className="grid overflow-hidden rounded-panel border border-line bg-white min-[1360px]:grid-cols-[minmax(0,1fr)_400px]">
        <AboutCanvas copy={about} photoUrl={settings.photoUrl} alt={`Photo of ${copy['about.name']}`} optimizable={optimizable} />
        <div className="border-line max-[1359px]:border-t min-[1360px]:border-l">
          <AboutInspect copy={about} name={copy['about.name']} openToProjects={settings.openToProjects} cvUrl={settings.cvUrl} />
        </div>
      </AboutStage>
    </Section>
  );
}
