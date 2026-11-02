import Link from 'next/link';
import {renderMarkdown} from '@/components/prose/markdown';
import {Button} from '@/components/ui-site/button';
import {isOptimizableCover} from '@/components/ui-site/cover-image';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Tag} from '@/components/ui-site/tag';
import {reasoningRows, tourAddress, tourFrames, tourHref} from '@/lib/tour';
import type {ProjectDetail, TourStop} from '@/server/content';
import {CaptureImage, PanSurface, Selection, type TourDevice} from './walkthrough-capture';
import {WalkthroughTour} from './walkthrough-stage';

const hostOf = (url: string | null) => (url ? new URL(url).hostname.replace(/^www\./, '') : null);

const EXTERNAL_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const HEADING = 'm-0 font-display text-[clamp(36px,3.6vw,52px)] leading-[0.98] font-bold tracking-[-0.04em]';
const DEVICES: TourDevice[] = ['desktop', 'mobile'];
const NOTE_ROW = 'grid grid-cols-[84px_minmax(0,1fr)] items-baseline gap-3';
const NOTE_TERM = 'font-mono text-xs tracking-[0.06em] text-muted uppercase';

type StaticCaptureProps = {
  stop: TourStop;
  host: string | null;
  optimizedUrls: string[];
  first?: boolean;
};

/** A note's own capture, for readers without the pinned frame: no JavaScript, or reduced motion. One device shows at a time, by CSS. */
function StaticCapture({stop, host, optimizedUrls, first = false}: StaticCaptureProps) {
  const caption = tourAddress(stop.path, host);
  return (
    <figure className="walkthrough-static-only m-0 max-lg:mt-6">
      <figcaption className="walkthrough-static-caption flex min-h-9 items-center rounded-t-[14px] border border-b-0 border-line bg-white px-3 font-mono text-xs text-ink">
        {caption.host}
        {caption.path}
      </figcaption>
      <div data-theme="light" className="walkthrough-viewport walkthrough-static-frame relative overflow-hidden border border-line bg-white">
        {DEVICES.map((device) => (
          <div key={device} data-layer={device} data-state="active" className="walkthrough-page">
            <PanSurface view={stop.positions[device]} capture={stop.captures[device]}>
              <CaptureImage
                stop={stop}
                device={device}
                optimized={optimizedUrls.includes(stop.captures[device].url)}
                zoom={stop.positions[device].zoom}
                first={first}
              />
              <Selection stop={stop} device={device} on />
            </PanSurface>
          </div>
        ))}
      </div>
    </figure>
  );
}

type HeroProps = {
  project: ProjectDetail;
  opening: TourStop;
  host: string | null;
  optimizedUrls: string[];
};

function Hero({project, opening, host, optimizedUrls}: HeroProps) {
  return (
    <header className="walkthrough-static-row pt-2 pr-5 pb-8 pl-5 md:px-14 lg:pr-10 lg:pb-20 lg:pl-(--gutter)">
      <div className="flex flex-col gap-5 max-lg:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Link href="/#work" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink no-underline hover:text-accent">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            All work
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {project.repoUrl ? (
              <Button href={project.repoUrl} rel="noreferrer" size="sm" variant="secondary">
                Repository
                {EXTERNAL_ICON}
              </Button>
            ) : null}
            {project.liveUrl ? (
              <Button href={project.liveUrl} rel="noreferrer" size="sm">
                Live site
                {EXTERNAL_ICON}
              </Button>
            ) : null}
          </div>
        </div>
        <Eyebrow>{project.kindLabel}</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(44px,5.2vw,72px)] leading-[0.98] font-bold tracking-[-0.04em]">{project.title}</h1>
        <p className="m-0 text-lg leading-[1.55] text-muted max-md:text-base">{project.summary}</p>
        <dl className="m-0 mt-1 flex flex-col gap-3 border-t border-line pt-4">
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3">
            <dt className={NOTE_TERM}>Role</dt>
            <dd className="m-0 text-[15px] leading-snug">{project.role ?? '[Role]'}</dd>
          </div>
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3">
            <dt className={NOTE_TERM}>Stack</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      <StaticCapture stop={opening} host={host} optimizedUrls={optimizedUrls} first />
    </header>
  );
}

/** The note with this stop's words picked out. The words themselves never change. */
function NoteBody({body, emphasis}: {body: string; emphasis: string | null}) {
  const at = emphasis ? body.indexOf(emphasis) : -1;
  if (!emphasis || at < 0) return <p className="m-0 text-lg leading-[1.5] max-md:text-base">{body}</p>;
  return (
    <p className="m-0 text-lg leading-[1.5] text-muted max-md:text-base">
      {body.slice(0, at)}
      <strong className="font-semibold text-ink">{emphasis}</strong>
      {body.slice(at + emphasis.length)}
    </p>
  );
}

type NoteProps = {
  note: TourStop;
  number: number;
  liveUrl: string | null;
  host: string | null;
  optimizedUrls: string[];
};

function Note({note, number, liveUrl, host, optimizedUrls}: NoteProps) {
  const href = tourHref(note.path, liveUrl);
  // The page row names the path alone, or a full address's own host and path
  const address = tourAddress(note.path, null);
  const page = `${address.host ?? ''}${address.path}`;
  return (
    <li data-stop={number} className="walkthrough-note pl-5 lg:pl-7">
      <div className="walkthrough-static-row flex min-h-[46svh] flex-col gap-3 pb-14 lg:min-h-[66svh]">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs font-medium text-muted">{String(number).padStart(2, '0')}</span>
          <h3 className="m-0 font-display text-[28px] leading-[1.08] font-bold tracking-[-0.03em]">{note.heading}</h3>
          <NoteBody body={note.note} emphasis={note.emphasis} />
          <dl className="m-0 mt-2 flex flex-col gap-2.5">
            <div className={NOTE_ROW}>
              <dt className={NOTE_TERM}>Selected</dt>
              <dd className="m-0">
                <span className="inline-block rounded-[3px] bg-accent px-2 py-1 font-mono text-[11px] leading-none font-medium text-on-accent">
                  {note.selected}
                </span>
              </dd>
            </div>
            <div className={NOTE_ROW}>
              <dt className={NOTE_TERM}>On screen</dt>
              <dd className="m-0 text-[15px] leading-snug text-muted">{note.onScreen}</dd>
            </div>
            <div className={NOTE_ROW}>
              <dt className={NOTE_TERM}>Page</dt>
              <dd className="m-0">
                {href ? (
                  <a
                    href={href}
                    rel="noreferrer"
                    className="-my-3 inline-flex min-h-11 scroll-mt-[46svh] scroll-mb-24 items-center gap-1.5 font-mono text-xs break-all lg:scroll-mt-24"
                  >
                    {page}
                    <span className="sr-only">: open {note.heading} on the live site</span>
                    {EXTERNAL_ICON}
                  </a>
                ) : (
                  <span className="font-mono text-xs">{page}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
        <StaticCapture stop={note} host={host} optimizedUrls={optimizedUrls} />
      </div>
    </li>
  );
}

/** The case study's write-up, then the reasoning rows that have text. Quiet, so the frame stays the one loud thing on the page. */
async function AfterTour({project}: {project: ProjectDetail}) {
  const markdown = project.caseStudy?.trim() ? await renderMarkdown(project.caseStudy) : null;
  const rows = reasoningRows(project);
  if (!markdown && rows.length === 0) return null;
  return (
    <div className="border-y border-line bg-white px-14 py-28 max-md:px-5 max-md:py-18">
      <div className="mx-auto flex max-w-site flex-col gap-20 max-md:gap-14">
        {markdown ? (
          <section aria-label="The write-up" className="flex flex-col gap-6">
            <Eyebrow>The write-up</Eyebrow>
            {markdown.content}
          </section>
        ) : null}
        {rows.length > 0 ? (
          <section aria-labelledby="walkthrough-why" className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <Eyebrow>Reasoning</Eyebrow>
              <h2 id="walkthrough-why" className={HEADING}>
                Why we built it <Mark>this way</Mark>
              </h2>
            </div>
            <div>
              {rows.map(({label, text}) => (
                <div
                  key={label}
                  className="grid gap-6 border-t border-line py-10 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16"
                >
                  <h3 className="m-0 font-display text-[28px] leading-[1.08] font-bold tracking-[-0.03em]">{label}</h3>
                  <p className="m-0 max-w-[60ch] text-lg leading-[1.55] whitespace-pre-line max-md:text-base">{text}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

/** "The Walkthrough": an annotated tour of the shipped site. One pinned browser moves through the captures while the notes scroll past it. */
export function Walkthrough({project}: {project: ProjectDetail}) {
  const host = hostOf(project.liveUrl);
  const {opening, notes, frames} = tourFrames(project.tourStops);
  const optimizedUrls = frames.flatMap(({captures}) => [captures.desktop.url, captures.mobile.url]).filter(isOptimizableCover);
  return (
    <article>
      <WalkthroughTour
        frames={frames}
        liveUrl={project.liveUrl}
        host={host}
        optimizedUrls={optimizedUrls}
        hero={<Hero project={project} opening={opening} host={host} optimizedUrls={optimizedUrls} />}
        notes={
          <section aria-labelledby="walkthrough-tour" className="pr-5 pl-5 md:px-14 lg:pr-10 lg:pl-(--gutter)">
            <div className="flex flex-col gap-5 py-10 lg:pt-0 lg:pb-14">
              <Eyebrow>The tour</Eyebrow>
              <h2 id="walkthrough-tour" className={HEADING}>
                The site, <br className="max-lg:hidden" />
                <Mark>page by page</Mark>
              </h2>
            </div>
            <ol className="m-0 list-none border-l border-line p-0 pb-16 lg:pb-[28svh]">
              {notes.map((note, index) => (
                <Note key={note.key} note={note} number={index + 1} liveUrl={project.liveUrl} host={host} optimizedUrls={optimizedUrls} />
              ))}
            </ol>
          </section>
        }
      />
      <AfterTour project={project} />
    </article>
  );
}
