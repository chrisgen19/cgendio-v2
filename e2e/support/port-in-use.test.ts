import {createServer} from 'node:net';
import {describe, expect, it} from 'vitest';
import {portInUse} from './port-in-use';

describe('portInUse', () => {
  it('sees a server that is listening, and not one that has closed', async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (address === null || typeof address === 'string') throw new Error('no port');

    expect(await portInUse(address.port)).toBe(true);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    expect(await portInUse(address.port)).toBe(false);
  });
});
