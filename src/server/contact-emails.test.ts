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
  it('thanks the visitor by first name and quotes what they sent', async () => {
    const email = await renderContactAutoReply(message, SITE);
    expect(email.subject).toBe("Thanks, I've got your message");
    expect(email.text).toContain("Hi Maria, I'll read it myself and get back to you at maria@example.com.");
    expect(email.text).toContain('What you sent (Next.js & React):');
    expect(email.html).toContain('cgdiomampo.dev');
    expect(email.html).toContain('&lt;b&gt;our&lt;/b&gt;');
  });
});
