import {Heading, Link, Section, Text} from 'react-email';
import {EmailShell} from './email-shell';
import {EMAIL_COLORS, headingStyle, highlightStyle} from './email-tokens';

export type ContactAutoReplyEmailProps = {
  email: string;
  siteUrl: string;
  host: string;
};

/**
 * The visitor's confirmation, in the words of the form's own success message. It never repeats anything they typed
 * (their message or their name): anyone can enter any address, so echoing their text would let the form relay spam or
 * phishing links from this domain. Their own address is the only visitor input it shows.
 */
export function ContactAutoReplyEmail({email, siteUrl, host}: ContactAutoReplyEmailProps) {
  return (
    <EmailShell
      preview={`I'll read it myself and get back to you at ${email}.`}
      host={host}
      footer={`You're getting this because you used the contact form on ${host}. Reply to this email to reach me directly.`}
    >
      <Heading as="h1" style={{...headingStyle, marginBottom: '16px'}}>
        Thanks, I&apos;ve got your <span style={highlightStyle}>message</span>.
      </Heading>
      <Text style={{margin: '0 0 24px', fontSize: '16px', lineHeight: '1.6', color: EMAIL_COLORS.muted}}>
        I&apos;ll read it myself and get back to you at{' '}
        <Link href={`mailto:${email}`} style={{color: EMAIL_COLORS.accent}}>
          {email}
        </Link>
        .
      </Text>
      <Section>
        <Text style={{margin: 0, fontSize: '15px', lineHeight: '1.6', color: EMAIL_COLORS.ink}}>
          Christian Diomampo
          <br />
          <Link href={siteUrl} style={{color: EMAIL_COLORS.accent, textDecoration: 'none'}}>
            {host}
          </Link>
        </Text>
      </Section>
    </EmailShell>
  );
}
