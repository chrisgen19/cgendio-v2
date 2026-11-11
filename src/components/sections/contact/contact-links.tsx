import {Button} from '@/components/ui-site/button';
import type {PageCopy, SiteSettings} from '@/server/content';

const SOCIALS = [
  {key: 'github', label: 'GitHub'},
  {key: 'linkedin', label: 'LinkedIn'},
] as const;

/** The row under the contact card: the CV (only once uploaded) and the profile links that are set in admin Settings. */
export function ContactLinks({copy, settings}: {copy: PageCopy; settings: SiteSettings}) {
  const socials = SOCIALS.flatMap(({key, label}) => {
    const href = settings.socials[key];
    return href ? [{key, label, href}] : [];
  });
  if (!settings.cvUrl && socials.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {settings.cvUrl ? (
        <Button href={settings.cvUrl} size="sm" data-track="cv_download">
          {copy['contact.cvLabel']}
        </Button>
      ) : null}
      {socials.map((social) => (
        <Button key={social.key} href={social.href} variant="secondary" size="sm" rel="me noopener" target="_blank">
          {social.label}
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ))}
    </div>
  );
}
