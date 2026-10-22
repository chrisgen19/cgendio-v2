import {createAuthClient} from 'better-auth/react';

/** Browser side of Better Auth (same origin, so no baseURL). Used by the admin sign-in and sign-out buttons. */
export const authClient = createAuthClient();
