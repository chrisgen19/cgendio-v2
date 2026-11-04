import {isEmail} from '@/lib/email';
import type {PageCopy, SiteSettings} from '@/server/content';
import {CopyEmailButton} from './copy-email-button';
import {TiltCard} from './tilt-card';

/**
 * The business card itself: an ink card (it inverts in dark mode) with the "cg" mark, name, role, status, email and
 * location. The `[YOUR EMAIL]` placeholder shows as plain text, with no link and no copy button.
 */
export function ContactCard({copy, settings}: {copy: PageCopy; settings: SiteSettings}) {
  const email = settings.contactEmail;
  const live = isEmail(email);

  return (
    <TiltCard>
      <div className="relative flex aspect-[1.66] flex-col justify-between gap-8 overflow-hidden rounded-card bg-ink p-8 text-white shadow-(--shadow-deep) max-md:aspect-auto max-md:p-6">
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="inline-grid size-11 shrink-0 place-items-center rounded-logo bg-white font-display text-lg leading-none font-extrabold tracking-[-0.04em] text-ink"
          >
            cg
          </span>
          <p className="m-0 flex items-center gap-2 pt-1 text-right font-mono text-xs leading-snug text-white/75">
            <i
              aria-hidden="true"
              className={
                settings.openToProjects
                  ? 'block size-2 shrink-0 rounded-full bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.25)]'
                  : 'block size-2 shrink-0 rounded-full bg-white/40'
              }
            />
            {settings.openToProjects ? copy['about.status.open'] : copy['about.status.closed']}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="m-0 font-display text-[clamp(28px,2.6vw,36px)] leading-none font-bold tracking-[-0.035em]">{copy['about.name']}</p>
          <p className="m-0 text-[15px] text-white/75">{copy['about.role.value']}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            {live ? (
              <a
                href={`mailto:${email}`}
                className="relative inline-flex min-h-11 items-center font-mono text-base break-all text-white underline decoration-white/35 underline-offset-[5px] hover:text-white hover:decoration-white focus-visible:outline-white"
              >
                {email}
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center font-mono text-base text-white">{email}</span>
            )}
            {live ? <CopyEmailButton address={email} /> : null}
          </div>
          <p className="m-0 border-t border-white/15 pt-3 font-mono text-xs leading-snug text-white/65">{copy['contact.location']}</p>
        </div>
      </div>
    </TiltCard>
  );
}
