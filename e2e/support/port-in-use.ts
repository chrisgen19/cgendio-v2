import {connect} from 'node:net';

/**
 * Whether something already accepts connections on this local port. prepare.mts checks the e2e ports with it before
 * resetting the database: locally Playwright reuses a server already on its port, so a server from another checkout (two
 * instances on the same port block) or from an earlier run would be tested instead of this checkout's new build.
 */
export const portInUse = (port: number, host = '127.0.0.1', timeoutMs = 1000) =>
  new Promise<boolean>((resolve) => {
    const socket = connect({port, host});
    const done = (inUse: boolean) => {
      socket.destroy();
      resolve(inUse);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
