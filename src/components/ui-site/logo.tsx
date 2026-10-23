import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="relative inline-flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline after:absolute after:-inset-y-1 after:inset-x-0 after:content-[''] hover:text-ink"
    >
      {/* Ink in both themes; the faint ring only shows on the dark page, where the square would otherwise vanish */}
      <b
        data-theme="light"
        className="inline-grid size-9 place-items-center rounded-logo bg-ink font-display text-base leading-none font-extrabold tracking-[-0.04em] text-lime ring-1 ring-white/14"
      >
        cg
      </b>
      cgdiomampo.dev
    </Link>
  );
}
