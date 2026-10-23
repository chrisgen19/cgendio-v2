import 'server-only';
import {Resend} from 'resend';
import {projectTypeLabel} from '@/lib/contact';
import {isEmail} from '@/lib/email';
import {mailEnv, serverEnv} from '@/lib/env';
import {getSiteSettings} from './content';
import {db} from './db';

/**
 * Emails a stored contact message to the contact address from admin Settings, then records it as emailed. Without a
 * Resend key or a real contact address (still `[YOUR EMAIL]`) nothing is sent: development prints the email instead,
 * production logs one line so the gap is visible. The message itself is already safe in the database either way.
 */
export const notifyContactMessage = async (id: string) => {
  const message = await db.contactMessage.findUnique({where: {id}});
  if (!message) return;
  const {RESEND_API_KEY, MAIL_FROM} = mailEnv();
  const {contactEmail} = await getSiteSettings();

  // Header injection: the subject can't carry line breaks from the visitor's name
  const subject = `New inquiry: ${projectTypeLabel(message.projectType)} from ${message.name}`.replace(/[\r\n]+/g, ' ');
  const text = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Company: ${message.company ?? '-'}`,
    `Project type: ${projectTypeLabel(message.projectType)}`,
    '',
    message.message,
  ].join('\n');

  if (!RESEND_API_KEY || !isEmail(contactEmail)) {
    if (serverEnv().NODE_ENV === 'production') {
      console.warn('[contact] Email not sent: set RESEND_API_KEY and a real contact email in admin Settings.');
    } else {
      console.info(`[contact] Email not sent (no Resend key or contact email). It would go to ${contactEmail}:\nSubject: ${subject}\n\n${text}`);
    }
    return;
  }

  const {error} = await new Resend(RESEND_API_KEY).emails.send({from: MAIL_FROM, to: contactEmail, subject, text, replyTo: message.email});
  if (error) {
    console.warn(`[contact] Email failed: ${error.name}`);
    return;
  }
  await db.contactMessage.update({where: {id}, data: {emailedAt: new Date()}});
};
