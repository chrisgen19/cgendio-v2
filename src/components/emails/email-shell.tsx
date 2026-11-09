import type {ReactNode} from 'react';
import {Body, Column, Container, Head, Html, Preview, Row, Section, Text} from 'react-email';
import {EMAIL_COLORS, EMAIL_FONTS, EMAIL_FONTS_URL, eyebrowStyle} from './email-tokens';

type EmailShellProps = {
  /** The inbox preview line shown after the subject */
  preview: string;
  /** The site's host, shown next to the logo */
  host: string;
  /** Optional lime label on the right of the masthead */
  label?: string;
  footer: string;
  children: ReactNode;
};

/** The shared "ink masthead" layout: grey page, white 22px card with a dark header band, small footer under the card. */
export function EmailShell({preview, host, label, footer, children}: EmailShellProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <link rel="stylesheet" href={EMAIL_FONTS_URL} />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{margin: 0, padding: '32px 12px', backgroundColor: EMAIL_COLORS.ground, fontFamily: EMAIL_FONTS.body}}>
        <Container
          style={{
            maxWidth: '600px',
            backgroundColor: EMAIL_COLORS.white,
            border: `1px solid ${EMAIL_COLORS.line}`,
            borderRadius: '22px',
            overflow: 'hidden',
          }}
        >
          <Section style={{backgroundColor: EMAIL_COLORS.ink, padding: '20px 28px'}}>
            <Row>
              <Column style={{verticalAlign: 'middle'}}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '34px',
                    height: '34px',
                    lineHeight: '34px',
                    textAlign: 'center',
                    borderRadius: '11px',
                    backgroundColor: EMAIL_COLORS.lime,
                    color: EMAIL_COLORS.ink,
                    fontFamily: EMAIL_FONTS.display,
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    verticalAlign: 'middle',
                  }}
                >
                  cg
                </span>
                <span style={{marginLeft: '10px', color: EMAIL_COLORS.white, fontSize: '14px', verticalAlign: 'middle'}}>{host}</span>
              </Column>
              {label ? (
                <Column align="right" style={{verticalAlign: 'middle'}}>
                  <span style={{...eyebrowStyle, color: EMAIL_COLORS.lime}}>{label}</span>
                </Column>
              ) : null}
            </Row>
          </Section>
          <Section style={{padding: '32px 28px 36px'}}>{children}</Section>
        </Container>
        <Text style={{maxWidth: '520px', margin: '18px auto 0', textAlign: 'center', fontSize: '12px', lineHeight: '1.6', color: EMAIL_COLORS.muted}}>
          {footer}
        </Text>
      </Body>
    </Html>
  );
}

/** A message with its line breaks kept: Outlook ignores `white-space: pre-wrap`, so lines become `<br>`s. */
export function MessageBody({message}: {message: string}) {
  const lines = message.split(/\r?\n/);
  return (
    <Text style={{margin: 0, fontSize: '15px', lineHeight: '1.6', color: EMAIL_COLORS.ink, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
      {lines.map((line, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lines are static text with no identity of their own
        <span key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </Text>
  );
}

/** The soft grey box the message sits in, with a mono label on top. */
export function MessageBox({label, message}: {label: string; message: string}) {
  return (
    <Section style={{backgroundColor: EMAIL_COLORS.ground, borderRadius: '16px', padding: '20px 22px'}}>
      <Text style={{...eyebrowStyle, marginBottom: '10px'}}>{label}</Text>
      <MessageBody message={message} />
    </Section>
  );
}
