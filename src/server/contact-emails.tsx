import 'server-only';
import {render} from 'react-email';
import {ContactAutoReplyEmail} from '@/components/emails/contact-auto-reply-email';
import {ContactNotificationEmail} from '@/components/emails/contact-notification-email';
import {projectTypeLabel} from '@/lib/contact';

export type ContactEmailMessage = {
  name: string;
  email: string;
  company: string | null;
  projectType: string;
  message: string;
  createdAt: Date;
};

export type RenderedEmail = {subject: string; html: string; text: string};

/** Same format as the admin inbox, in Christian's time zone. */
const RECEIVED = new Intl.DateTimeFormat('en-AU', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila'});

/** Header injection: nothing from the visitor may put a line break into a header. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const firstNameOf = (name: string) => oneLine(name).split(/\s+/)[0] || name;

const hostOf = (siteUrl: string) => new URL(siteUrl).host;

/** The email I receive for a new contact message, as HTML plus a plain-text alternative. */
export const renderContactNotification = async (message: ContactEmailMessage, siteUrl: string): Promise<RenderedEmail> => {
  const topic = projectTypeLabel(message.projectType);
  const firstName = firstNameOf(message.name);
  const receivedAt = RECEIVED.format(message.createdAt);
  const inboxUrl = `${siteUrl}/admin/inbox`;
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${topic}`)}`;

  const html = await render(
    <ContactNotificationEmail
      name={message.name}
      firstName={firstName}
      email={message.email}
      company={message.company}
      topic={topic}
      message={message.message}
      receivedAt={receivedAt}
      replyHref={replyHref}
      inboxUrl={inboxUrl}
      host={hostOf(siteUrl)}
    />,
  );
  const text = [
    // One line each, so a line break typed into a field can't fake another field (such as a second "Email:")
    `New message from ${oneLine(message.name)}`,
    '',
    `Name: ${oneLine(message.name)}`,
    `Email: ${message.email}`,
    `Company: ${message.company === null ? '-' : oneLine(message.company)}`,
    `Topic: ${topic}`,
    `Received: ${receivedAt}`,
    '',
    message.message,
    '',
    `Open in inbox: ${inboxUrl}`,
  ].join('\n');

  return {subject: oneLine(`New inquiry: ${topic} from ${message.name}`), html, text};
};

/** The visitor's confirmation that their message arrived. It never repeats their message or name (see `ContactAutoReplyEmail`). */
export const renderContactAutoReply = async (message: ContactEmailMessage, siteUrl: string): Promise<RenderedEmail> => {
  const host = hostOf(siteUrl);

  const html = await render(<ContactAutoReplyEmail email={message.email} siteUrl={siteUrl} host={host} />);
  const text = [
    "Thanks, I've got your message.",
    '',
    `I'll read it myself and get back to you at ${message.email}.`,
    '',
    'Christian Diomampo',
    siteUrl,
    '',
    `You're getting this because you used the contact form on ${host}. Reply to this email to reach me directly.`,
  ].join('\n');

  return {subject: "Thanks, I've got your message", html, text};
};
