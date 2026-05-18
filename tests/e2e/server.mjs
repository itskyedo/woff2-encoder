import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.E2E_PORT ?? process.env.PORT ?? 4173);
const rootDir = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const mimeTypes = new Map([
  ['.cjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.otf', 'font/otf'],
  ['.ttf', 'font/ttf'],
  ['.wasm', 'application/wasm'],
  ['.woff2', 'font/woff2'],
]);

/**
 * Returns true when a request path stays inside the repository root.
 *
 * @param filePath - The resolved file path to validate.
 * @returns Whether the file can be served.
 */
function isInsideRoot(filePath) {
  return filePath === rootDir || filePath.startsWith(`${rootDir}${sep}`);
}

/**
 * Sends a plain text response.
 *
 * @param response - The HTTP response object.
 * @param statusCode - The status code to send.
 * @param message - The response body.
 * @returns Nothing.
 */
function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf-8',
  });
  response.end(message);
}

/**
 * Handles one static file request.
 *
 * @param request - The HTTP request object.
 * @param response - The HTTP response object.
 * @returns A promise that resolves after the response is handled.
 */
async function serve(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed');
    return;
  }

  let filePath;
  try {
    const requestUrl = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? `${host}:${port}`}`
    );
    const pathname =
      requestUrl.pathname === '/'
        ? '/tests/e2e/fixtures/index.html'
        : decodeURIComponent(requestUrl.pathname);
    filePath = resolve(rootDir, `.${pathname}`);
  } catch (_error) {
    sendText(response, 400, 'Bad request');
    return;
  }

  if (!isInsideRoot(filePath)) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'content-length': fileStat.size,
      'content-type':
        mimeTypes.get(extname(filePath)) ?? 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (_error) {
    sendText(response, 404, 'Not found');
  }
}

const server = createServer((request, response) => {
  void serve(request, response);
});

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} at http://${host}:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
