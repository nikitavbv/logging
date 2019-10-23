import http from 'http';

import config from './src/config';

import routingInit from './src/routing';

const router = routingInit();

http.createServer(router.server.bind(router))
    .listen(config.port, () => console.log(`http server started on port ${config.port}`));
