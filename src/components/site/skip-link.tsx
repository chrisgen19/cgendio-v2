/**
 * First focusable element on every public page: hidden until focused, then a pill in the top-left corner. Its offsets
 * clear the safe-area insets, because `viewport-fit: cover` (#112) would otherwise put it under the status bar and
 * behind the cutout in landscape, where it is the one element that has to be visible the moment it takes focus.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-pill bg-ink px-5 font-semibold text-white no-underline focus:not-sr-only focus:fixed focus:top-[calc(0.75rem+env(safe-area-inset-top,0px))] focus:left-[calc(0.75rem+env(safe-area-inset-left,0px))] focus:inline-flex focus:min-h-11 focus:items-center hover:text-white"
    >
      Skip to content
    </a>
  );
}
