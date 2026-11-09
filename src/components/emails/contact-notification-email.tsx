import type {ReactNode} from 'react';
import {Button, Heading, Link, Section, Text} from 'react-email';
import {EmailShell, MessageBox} from './email-shell';
import {EMAIL_COLORS, eyebrowStyle, headingStyle, highlightStyle, pillButtonStyle} from './email-tokens';

export type ContactNotificationEmailProps = {
  name: string;
  firstName: string;
  email: string;
  company: string | null;
  topic: string;
  message: string;
  receivedAt: string;
  replyHref: string;
  inboxUrl: string;
  host: string;
};

const cellBorder = (first: boolean) => (first ? undefined : `1px solid ${EMAIL_COLORS.line}`);

/** The email I get for each contact form message: who, what about, the message, and buttons to reply or open the inbox. */
export function ContactNotificationEmail(props: ContactNotificationEmailProps) {
  const {name, firstName, email, company, topic, message, receivedAt, replyHref, inboxUrl, host} = props;
  const rows: [string, ReactNode][] = [
    ['Name', name],
    [
      'Email',
      <Link key="email" href={`mailto:${email}`} style={{color: EMAIL_COLORS.accent}}>
        {email}
      </Link>,
    ],
    ['Company', company ?? '-'],
    ['Topic', topic],
    ['Received', receivedAt],
  ];

  return (
    <EmailShell
      preview={`${topic}: ${message.slice(0, 90)}`}
      host={host}
      label="New inquiry"
      footer={`Sent from the contact form on ${host}. Replying goes straight to ${firstName}.`}
    >
      <Text style={{...eyebrowStyle, marginBottom: '12px'}}>{topic}</Text>
      <Heading as="h1" style={{...headingStyle, marginBottom: '24px'}}>
        New message from <span style={highlightStyle}>{firstName}</span>
      </Heading>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{borderCollapse: 'collapse', marginBottom: '24px'}}>
        <tbody>
          {rows.map(([label, value], index) => (
            <tr key={label}>
              <td style={{...eyebrowStyle, width: '112px', padding: '11px 12px 11px 0', verticalAlign: 'top', borderTop: cellBorder(index === 0)}}>
                {label}
              </td>
              <td style={{padding: '10px 0', fontSize: '15px', lineHeight: '1.5', color: EMAIL_COLORS.ink, borderTop: cellBorder(index === 0)}}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <MessageBox label="Message" message={message} />
      <Section style={{paddingTop: '24px'}}>
        <Button href={replyHref} style={{...pillButtonStyle, backgroundColor: EMAIL_COLORS.ink, color: EMAIL_COLORS.white, marginRight: '8px'}}>
          Reply to {firstName}
        </Button>
        <Button
          href={inboxUrl}
          style={{...pillButtonStyle, backgroundColor: EMAIL_COLORS.white, color: EMAIL_COLORS.ink, border: `1px solid ${EMAIL_COLORS.line}`}}
        >
          Open in inbox
        </Button>
      </Section>
    </EmailShell>
  );
}
