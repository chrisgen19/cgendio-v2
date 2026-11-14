import {Button} from '@/components/ui-site/button';
import type {PageCopy, SiteSettings} from '@/server/content';

const SOCIALS = [
  {key: 'github', label: 'GitHub'},
  {key: 'linkedin', label: 'LinkedIn'},
] as const;

/**
 * The CV buttons for the Contact section. With both cuts uploaded the visitor picks the paper size themselves, each
 * button sending its own `cv_download` event with a `format` param; with only the A4 one it falls back to a single
 * unlabelled button, so the section reads the same as it did before the Letter cut existed.
 */
const cvButtons = ({copy, settings}: {copy: PageCopy; settings: SiteSettings}) => {
  if (!settings.cvUrl) return [];
  if (!settings.cvUrlLetter) return [{key: 'only', href: settings.cvUrl, label: copy['contact.cvLabel'], format: undefined}];
  return [
    {key: 'a4', href: settings.cvUrl, label: copy['contact.cvLabelA4'], format: 'a4'},
    {key: 'letter', href: settings.cvUrlLetter, label: copy['contact.cvLabelLetter'], format: 'letter'},
  ];
};

/** The row under the contact card: the CV (only once uploaded) and the profile links that are set in admin Settings. */
export function ContactLinks({copy, settings}: {copy: PageCopy; settings: SiteSettings}) {
  const socials = SOCIALS.flatMap(({key, label}) => {
    const href = settings.socials[key];
    return href ? [{key, label, href}] : [];
  });
  const cvs = cvButtons({copy, settings});
  if (cvs.length === 0 && socials.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {cvs.map((cv) => (
        <Button key={cv.key} href={cv.href} size="sm" data-track="cv_download" data-track-placement="contact" data-track-format={cv.format}>
          {cv.label}
        </Button>
      ))}
      {socials.map((social) => (
        <Button key={social.key} href={social.href} variant="secondary" size="sm" rel="me noopener" target="_blank">
          {social.label}
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ))}
    </div>
  );
}
