import {toNextJsHandler} from 'better-auth/next-js';
import {getAuth} from '@/server/auth';

// The auth instance is created on the first request, so building this route doesn't need the auth secrets
export const GET = (request: Request) => toNextJsHandler(getAuth()).GET(request);
export const POST = (request: Request) => toNextJsHandler(getAuth()).POST(request);
