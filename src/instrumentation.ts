/** Runs once per server start (never during `next build`). */
export async function register() {
  // Production only: `next dev` renders every request fresh anyway
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  const {revalidateContentOnStart} = await import('./server/startup-revalidation');
  // Not awaited: it calls this server, which only takes requests once register() has returned
  void revalidateContentOnStart();
}
