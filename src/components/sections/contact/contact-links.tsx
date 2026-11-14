import {Button} from '@/components/ui-site/button';
import type {PageCopy, SiteSettings} from '@/server/content';
import {CvDownloadMenu} from './cv-download-menu';

const SOCIALS = [
  {key: 'github', label: 'GitHub'},
  {key: 'linkedin', label: 'LinkedIn'},
] as const;

/**
 * The CV control for the Contact section. With both cuts uploaded it is one "Download CV" button whose menu lets the
 * visitor pick the paper size, each row sending its own `cv_download` event with a `format` param; with only the A4 one
 * it is a plain link, so the section reads the same as it did before the Letter cut existed.
 */
function ContactCv({copy, settings}: {copy: PageCopy; settings: SiteSettings}) {
  if (!settings.cvUrl) return null;
  if (!settings.cvUrlLetter) {
    return (
      <Button href={settings.cvUrl} size="sm" data-track="cv_download" data-track-placement="contact">
        {copy['contact.cvLabel']}
      </Button>
    );
  }
  return (
    <CvDownloadMenu
      label={copy['contact.cvLabel']}
      cuts={[
        {format: 'a4', href: settings.cvUrl, label: copy['contact.cvLabelA4']},
        {format: 'letter', href: settings.cvUrlLetter, label: copy['contact.cvLabelLetter']},
      ]}
    />
  );
}

/** The row under the contact card: the CV (only once uploaded) and the profile links that are set in admin Settings. */
export function ContactLinks({copy, settings}: {copy: PageCopy; settings: SiteSettings}) {
  const socials = SOCIALS.flatMap(({key, label}) => {
    const href = settings.socials[key];
    return href ? [{key, label, href}] : [];
  });
  if (!settings.cvUrl && socials.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ContactCv copy={copy} settings={settings} />
      {socials.map((social) => (
        <Button key={social.key} href={social.href} variant="secondary" size="sm" rel="me noopener" target="_blank">
          {social.label}
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ))}
    </div>
  );
}
