'use server';

import {createHmac} from 'node:crypto';
import {headers} from 'next/headers';
import {after} from 'next/server';
import {z} from 'zod';
import {type ContactField, type ContactResult, PROJECT_TYPE_VALUES} from '@/lib/contact';
import {authEnv} from '@/lib/env';
import {db} from '../db';
import {notifyContactMessage} from '../mail';

const RATE_LIMIT = {messages: 3, minutes: 10};

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(120).nullable(),
);

const contactSchema = z.object({
  name: z.string().trim().min(1, {error: 'Tell us your name.'}).max(120, {error: 'Tell us your name.'}),
  email: z
    .string()
    .trim()
    .pipe(z.email({error: 'Enter a valid email address.'}).max(200, {error: 'Enter a valid email address.'})),
  company: optionalText,
  projectType: z.enum(PROJECT_TYPE_VALUES, {error: "Pick what it's about."}),
  message: z
    .string()
    .trim()
    .min(20, {error: 'Add a few more details (at least 20 characters).'})
    .max(5000, {error: 'Keep it under 5,000 characters.'}),
});

/**
 * The visitor's IP as an HMAC, so the rate limit works without storing addresses. x-real-ip is set by the reverse
 * proxy; otherwise the last x-forwarded-for entry is the one the nearest proxy added (earlier ones can be forged).
 */
const clientIpHash = async () => {
  const request = await headers();
  const ip = request.get('x-real-ip')?.trim() || request.get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'unknown';
  return createHmac('sha256', authEnv().BETTER_AUTH_SECRET).update(`contact-ip:${ip}`).digest('hex');
};

/**
 * The public contact form. A filled honeypot gets a fake success and stores nothing; otherwise the message is
 * validated, rate limited per IP (three per ten minutes, checked atomically), stored, and emailed after the response is sent.
 */
export async function submitContact(_previous: ContactResult | null, formData: FormData): Promise<ContactResult> {
  if (String(formData.get('website') ?? '') !== '') return {ok: true};

  const input = contactSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    const errors = z.flattenError(input.error).fieldErrors as Partial<Record<ContactField, string[]>>;
    const fieldErrors = Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages?.[0]])) as Partial<
      Record<ContactField, string>
    >;
    return {ok: false, fieldErrors};
  }

  try {
    const ipHash = await clientIpHash();
    const since = new Date(Date.now() - RATE_LIMIT.minutes * 60_000);
    // Count and insert in one transaction behind a per-IP advisory lock (released at commit), so parallel requests from
    // the same IP queue up instead of all passing the count before any of them inserts
    const message = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${ipHash}, 0))`;
      const recent = await tx.contactMessage.count({where: {ipHash, createdAt: {gte: since}}});
      if (recent >= RATE_LIMIT.messages) return null;
      return tx.contactMessage.create({data: {...input.data, ipHash}, select: {id: true}});
    });
    if (!message) return {ok: false, error: 'Too many messages from this connection. Try again in a few minutes.'};
    after(() => notifyContactMessage(message.id));
  } catch {
    return {ok: false, error: 'Something went wrong. Please try again.'};
  }
  return {ok: true};
}
