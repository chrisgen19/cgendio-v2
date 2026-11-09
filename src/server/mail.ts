import 'server-only';
import {Resend} from 'resend';
import {isEmail} from '@/lib/email';
import {mailEnv, serverEnv, siteEnv} from '@/lib/env';
import {renderContactAutoReply, renderContactNotification} from './contact-emails';
import {getSiteSettings} from './content';
import {db} from './db';

/** One auto-reply per address per window, however many IPs the messages come from. */
const AUTO_REPLY_WINDOW_MS = 24 * 60 * 60_000;

type StoredMessage = {id: string; email: string; createdAt: Date};

/**
 * True when no other message from this address (in any letter case) came in during the 24 hours before this one.
 * Asking "is this the earliest" rather than "are there others" means messages sent at the same moment still get
 * exactly one auto-reply between them, without a lock: every row is stored before its email goes out, so each one
 * sees the same set of rows and only the earliest (ties broken by id) passes.
 */
export const isFirstFromAddress = async ({id, email, createdAt}: StoredMessage) => {
  const earlier = await db.contactMessage.count({
    where: {
      email: {equals: email, mode: 'insensitive'},
      createdAt: {gte: new Date(createdAt.getTime() - AUTO_REPLY_WINDOW_MS), lte: createdAt},
      OR: [{createdAt: {lt: createdAt}}, {createdAt, id: {lt: id}}],
    },
  });
  return earlier === 0;
};

/**
 * Emails a stored contact message to the contact address from admin Settings and records it as emailed, then sends
 * the visitor a confirmation that replies to that same address (the first message from an address in 24 hours only, so
 * the form can't be used to flood someone's inbox). Without a Resend key or a real contact address (such as the
 * `[YOUR EMAIL]` placeholder) nothing is sent: development prints the emails instead, production logs one line so the
 * gap is visible. The message itself is already safe in the database either way.
 */
export const notifyContactMessage = async (id: string) => {
  const message = await db.contactMessage.findUnique({where: {id}});
  if (!message) return;
  const {RESEND_API_KEY, MAIL_FROM} = mailEnv();
  const {contactEmail} = await getSiteSettings();
  const {NEXT_PUBLIC_SITE_URL: siteUrl} = siteEnv();

  const [notification, autoReply] = await Promise.all([
    renderContactNotification(message, siteUrl),
    isFirstFromAddress(message).then((first) => (first ? renderContactAutoReply(message, siteUrl) : null)),
  ]);

  if (!RESEND_API_KEY || !isEmail(contactEmail)) {
    if (serverEnv().NODE_ENV === 'production') {
      console.warn('[contact] Email not sent: set RESEND_API_KEY and a real contact email in admin Settings.');
    } else {
      console.info(
        `[contact] Email not sent (no Resend key or contact email). It would go to ${contactEmail}:\nSubject: ${notification.subject}\n\n${notification.text}`,
      );
      if (autoReply)
        console.info(`[contact] Auto-reply not sent. It would go to ${message.email}:\nSubject: ${autoReply.subject}\n\n${autoReply.text}`);
    }
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const [sent, replied] = await Promise.all([
    resend.emails.send({from: MAIL_FROM, to: contactEmail, replyTo: message.email, ...notification}),
    autoReply ? resend.emails.send({from: MAIL_FROM, to: message.email, replyTo: contactEmail, ...autoReply}) : null,
  ]);
  if (replied?.error) console.warn(`[contact] Auto-reply failed: ${replied.error.name}`);
  if (sent.error) {
    console.warn(`[contact] Email failed: ${sent.error.name}`);
    return;
  }
  await db.contactMessage.update({where: {id}, data: {emailedAt: new Date()}});
};
