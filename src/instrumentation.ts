/** Runs once per server start (never during `next build`). */
export async function register() {
  // Production only: `next dev` renders every request fresh anyway
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  // Before anything else: a missing secret should fail the deploy here, not a page later (#10 step 3). Next skips
  // register() during the production build, so the builder stage, which has none of these, is unaffected. It exits
  // rather than throwing; the module explains why.
  const {assertServerSecretsOrExit} = await import('./server/startup-env-check');
  assertServerSecretsOrExit();
  const {revalidateContentOnStart} = await import('./server/startup-revalidation');
  // Not awaited: it calls this server, which only takes requests once register() has returned
  void revalidateContentOnStart();
}
