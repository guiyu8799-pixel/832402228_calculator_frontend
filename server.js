/**
 * Minimal zero-dependency static file server for the calculator front end.
 *
 * The front end is plain HTML/CSS/JavaScript and therefore needs no bundler. Any static web
 * server works; this script exists so that a reviewer can start the client with a single
 * command on a machine that only has Node.js installed.
 *
 * Usage:
 *   node server.js            # http://localhost:5500
 *   node server.js 3000       # http://localhost:3000
 *
 * The web files are served from the "src" folder, which mirrors the project layout.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2] || process.env.PORT || 5500);
const ROOT = path.join(__dirname, 'src');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

function send(response, statusCode, contentType, body) {
    response.writeHead(statusCode, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
    });
    response.end(body);
}

const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(request.url.split('?')[0]);
    const relativePath = requestPath === '/' ? '/index.html' : requestPath;

    // Resolve inside ROOT and reject anything that escapes it (path traversal protection).
    const resolved = path.resolve(ROOT, '.' + relativePath);
    if (!resolved.startsWith(ROOT)) {
        send(response, 403, 'text/plain; charset=utf-8', 'Forbidden');
        return;
    }

    fs.stat(resolved, (statError, stats) => {
        if (statError || !stats.isFile()) {
            send(response, 404, 'text/plain; charset=utf-8', 'Not Found: ' + relativePath);
            return;
        }
        const contentType = MIME_TYPES[path.extname(resolved).toLowerCase()]
            || 'application/octet-stream';
        fs.readFile(resolved, (readError, content) => {
            if (readError) {
                send(response, 500, 'text/plain; charset=utf-8', 'Internal Server Error');
                return;
            }
            send(response, 200, contentType, content);
        });
    });
});

server.listen(PORT, () => {
    console.log('Calculator front end is running:');
    console.log('  http://localhost:' + PORT + '/');
    console.log('  http://localhost:' + PORT + '/?api=http://localhost:8080');
    console.log('Press Ctrl+C to stop.');
});
