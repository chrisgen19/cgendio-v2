import {beforeEach, describe, expect, it, vi} from 'vitest';

/* The contact emails with Prisma and Resend mocked: which emails go out, and the auto-reply limit per address. */

const db = vi.hoisted(() => ({
  contactMessage: {findUnique: vi.fn(), count: vi.fn(), update: vi.fn()},
}));
const send = vi.hoisted(() => vi.fn());

vi.mock('server-only', () => ({}));
vi.mock('./db', () => ({db}));
vi.mock('./content', () => ({getSiteSettings: async () => ({contactEmail: 'me@cgdiomampo.dev'})}));
vi.mock('@/lib/env', () => ({
  mailEnv: () => ({RESEND_API_KEY: 're_test', MAIL_FROM: 'Chris <hello@cgdiomampo.dev>'}),
  serverEnv: () => ({NODE_ENV: 'test'}),
  siteEnv: () => ({NEXT_PUBLIC_SITE_URL: 'https://cgdiomampo.dev'}),
}));
vi.mock('resend', () => ({
  Resend: class {
    emails = {send};
  },
}));

const {isFirstFromAddress, notifyContactMessage} = await import('./mail');

const message = {
  id: 'msg-2',
  name: 'Maria Santos',
  email: 'Maria@Example.com',
  company: null,
  projectType: 'NEXTJS',
  message: 'We need a new marketing site, please.',
  createdAt: new Date('2026-11-09T06:14:00Z'),
};

const recipients = () => send.mock.calls.map(([payload]) => payload.to);

beforeEach(() => {
  vi.clearAllMocks();
  db.contactMessage.findUnique.mockResolvedValue(message);
  send.mockResolvedValue({data: {id: 'email-1'}, error: null});
});

describe('isFirstFromAddress', () => {
  it('looks for an earlier message from the same address, in any case, in the 24 hours before this one', async () => {
    db.contactMessage.count.mockResolvedValue(0);
    expect(await isFirstFromAddress(message)).toBe(true);
    expect(db.contactMessage.count).toHaveBeenCalledWith({
      where: {
        email: {equals: 'Maria@Example.com', mode: 'insensitive'},
        createdAt: {gte: new Date('2026-11-08T06:14:00Z'), lte: message.createdAt},
        OR: [{createdAt: {lt: message.createdAt}}, {createdAt: message.createdAt, id: {lt: 'msg-2'}}],
      },
    });
  });

  it('is false when an earlier message from the address exists', async () => {
    db.contactMessage.count.mockResolvedValue(1);
    expect(await isFirstFromAddress(message)).toBe(false);
  });
});

describe('notifyContactMessage', () => {
  it('sends the notification and the auto-reply for the first message from an address', async () => {
    db.contactMessage.count.mockResolvedValue(0);
    await notifyContactMessage('msg-2');
    expect(recipients()).toEqual(['me@cgdiomampo.dev', 'Maria@Example.com']);
    expect(db.contactMessage.update).toHaveBeenCalledWith({where: {id: 'msg-2'}, data: {emailedAt: expect.any(Date)}});
  });

  it('sends only the notification when the address already had a message in the last 24 hours', async () => {
    db.contactMessage.count.mockResolvedValue(2);
    await notifyContactMessage('msg-2');
    expect(recipients()).toEqual(['me@cgdiomampo.dev']);
    expect(db.contactMessage.update).toHaveBeenCalledOnce();
  });
});
