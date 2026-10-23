/**
 * A stand-in for the Resend API during e2e runs. The app's real `resend` client talks to it through RESEND_BASE_URL:
 * POST /emails records the email and answers like Resend; GET /emails lists what was sent, for the tests to check.
 */
import {createServer, type ServerResponse} from 'node:http';
import {MOCK_RESEND_PORT} from './test-env.ts';

const emails: unknown[] = [];

const json = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, {'content-type': 'application/json'});
  response.end(JSON.stringify(body));
};

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/emails') {
    let body = '';
    for await (const chunk of request) body += chunk;
    emails.push(JSON.parse(body));
    return json(response, 200, {id: `mock-email-${emails.length}`});
  }
  if (request.method === 'GET' && request.url === '/emails') return json(response, 200, emails);
  if (request.method === 'GET' && request.url === '/health') return json(response, 200, {ok: true});
  return json(response, 404, {name: 'not_found', message: `${request.method} ${request.url} is not mocked`});
}).listen(MOCK_RESEND_PORT, '127.0.0.1', () => console.info(`Mock Resend listening on ${MOCK_RESEND_PORT}`));
