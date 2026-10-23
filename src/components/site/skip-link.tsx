/** First focusable element on every public page: hidden until focused, then a pill in the top-left corner. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-pill bg-ink px-5 font-semibold text-white no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:inline-flex focus:min-h-11 focus:items-center hover:text-white"
    >
      Skip to content
    </a>
  );
}
