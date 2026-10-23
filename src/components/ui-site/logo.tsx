import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="relative inline-flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline after:absolute after:-inset-y-1 after:inset-x-0 after:content-[''] hover:text-ink"
    >
      <b className="inline-grid size-9 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink">
        cg
      </b>
      cgdiomampo.dev
    </Link>
  );
}
