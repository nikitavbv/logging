import config from './src/config';

import http = require('http');

http.createServer((_: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('hello world!');
}).listen(config.port);