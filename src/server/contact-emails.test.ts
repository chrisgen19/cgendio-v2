import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

const {renderContactAutoReply, renderContactNotification} = await import('./contact-emails');

const SITE = 'https://cgdiomampo.dev';
const message = {
  name: 'Maria Santos',
  email: 'maria@example.com',
  company: null,
  projectType: 'NEXTJS',
  message: 'Hi Christian,\n\nCan you help with <b>our</b> site & blog?',
  createdAt: new Date('2026-11-09T06:14:00Z'),
};

describe('contact notification email', () => {
  it('builds a one-line subject even when the name has line breaks', async () => {
    const email = await renderContactNotification({...message, name: 'Maria\r\nBcc: x@example.com'}, SITE);
    expect(email.subject).toBe('New inquiry: Next.js & React from Maria Bcc: x@example.com');
  });

  it('keeps the name and company on one line each in the plain text, so they cannot fake another field', async () => {
    const {text} = await renderContactNotification({...message, name: 'Maria\nEmail: fake@example.com', company: 'Acme\r\nTopic: Fake'}, SITE);
    expect(text).toContain('New message from Maria Email: fake@example.com\n');
    expect(text).toContain('Name: Maria Email: fake@example.com\n');
    expect(text).toContain('Company: Acme Topic: Fake\n');
    expect(text.match(/^Email: /gm)).toEqual(['Email: ']);
    expect(text.match(/^Topic: /gm)).toEqual(['Topic: ']);
  });

  it('escapes the visitor message and keeps its line breaks', async () => {
    const {html} = await renderContactNotification(message, SITE);
    expect(html).toContain('&lt;b&gt;our&lt;/b&gt; site &amp; blog?');
    expect(html).not.toContain('<b>our</b>');
    expect(html).toMatch(/Hi Christian,<\/span><span><br\/>/);
  });

  it('links the reply button, the inbox and shows the time in Manila', async () => {
    const {html, text} = await renderContactNotification(message, SITE);
    expect(html).toContain('href="mailto:maria@example.com?subject=Re%3A%20Next.js%20%26%20React"');
    expect(html).toContain('href="https://cgdiomampo.dev/admin/inbox"');
    expect(html).toContain('Reply to <!-- -->Maria');
    expect(text).toContain('Company: -');
    expect(text).toContain('Received: 9 Nov 2026, 2:14 pm');
    expect(text).toContain('Open in inbox: https://cgdiomampo.dev/admin/inbox');
  });
});

describe('contact auto-reply email', () => {
  it('thanks the visitor in the words of the form success message', async () => {
    const email = await renderContactAutoReply(message, SITE);
    expect(email.subject).toBe("Thanks, I've got your message");
    expect(email.text).toContain("Thanks, I've got your message.\n\nI'll read it myself and get back to you at maria@example.com.");
    expect(email.html).toContain('cgdiomampo.dev');
  });

  it('never repeats the visitor name, so a link typed as a name cannot be relayed', async () => {
    const email = await renderContactAutoReply({...message, name: 'https://phish.example/claim-your-refund'}, SITE);
    for (const body of [email.html, email.text]) {
      expect(body).not.toContain('phish.example');
      expect(body).not.toContain('claim-your-refund');
    }
  });

  it('never quotes the visitor message, so the form cannot relay spam', async () => {
    const email = await renderContactAutoReply({...message, message: 'Cheap pills at https://spam.example now'}, SITE);
    for (const body of [email.html, email.text]) {
      expect(body).not.toContain('Cheap pills');
      expect(body).not.toContain('spam.example');
    }
  });
});
