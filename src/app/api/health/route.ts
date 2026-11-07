import {connection} from 'next/server';
import {getDatabaseState} from '@/server/health';

/**
 * Health check for Coolify and the Dockerfile's HEALTHCHECK. 200 whenever the server is up, with the database state in
 * the body for diagnosis. A database outage doesn't fail it on purpose: Traefik stops routing to an unhealthy
 * container, which would also take down the prerendered pages that keep working without Postgres.
 */
export async function GET() {
  await connection(); // per request, never prerendered
  return Response.json({status: 'ok', database: await getDatabaseState()}, {headers: {'Cache-Control': 'no-store'}});
}
