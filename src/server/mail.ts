import 'server-only';
import {Resend} from 'resend';
import {isEmail} from '@/lib/email';
import {mailEnv, serverEnv, siteEnv} from '@/lib/env';
import {renderContactAutoReply, renderContactNotification} from './contact-emails';
import {getSiteSettings} from './content';
import {db} from './db';

/**
 * Emails a stored contact message to the contact address from admin Settings and records it as emailed, then sends
 * the visitor a confirmation that replies to that same address. Without a Resend key or a real contact address (such
 * as the `[YOUR EMAIL]` placeholder) nothing is sent: development prints the emails instead, production logs one line
 * so the gap is visible. The message itself is already safe in the database either way.
 */
export const notifyContactMessage = async (id: string) => {
  const message = await db.contactMessage.findUnique({where: {id}});
  if (!message) return;
  const {RESEND_API_KEY, MAIL_FROM} = mailEnv();
  const {contactEmail} = await getSiteSettings();
  const {NEXT_PUBLIC_SITE_URL: siteUrl} = siteEnv();

  const [notification, autoReply] = await Promise.all([renderContactNotification(message, siteUrl), renderContactAutoReply(message, siteUrl)]);

  if (!RESEND_API_KEY || !isEmail(contactEmail)) {
    if (serverEnv().NODE_ENV === 'production') {
      console.warn('[contact] Email not sent: set RESEND_API_KEY and a real contact email in admin Settings.');
    } else {
      console.info(
        `[contact] Email not sent (no Resend key or contact email). It would go to ${contactEmail}:\nSubject: ${notification.subject}\n\n${notification.text}`,
      );
      console.info(`[contact] Auto-reply not sent. It would go to ${message.email}:\nSubject: ${autoReply.subject}\n\n${autoReply.text}`);
    }
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const [sent, replied] = await Promise.all([
    resend.emails.send({from: MAIL_FROM, to: contactEmail, replyTo: message.email, ...notification}),
    resend.emails.send({from: MAIL_FROM, to: message.email, replyTo: contactEmail, ...autoReply}),
  ]);
  if (replied.error) console.warn(`[contact] Auto-reply failed: ${replied.error.name}`);
  if (sent.error) {
    console.warn(`[contact] Email failed: ${sent.error.name}`);
    return;
  }
  await db.contactMessage.update({where: {id}, data: {emailedAt: new Date()}});
};
