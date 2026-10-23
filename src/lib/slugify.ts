/** "Off-hire landing page & form" -> "off-hire-landing-page-form". Accents are stripped (é -> e). */
export const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    // Cut before trimming, so a cut that lands on a hyphen doesn't leave one at the end (the slug schema rejects it)
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
