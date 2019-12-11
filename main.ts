import http from 'http';

import config from './src/config';

import databaseInit from './src/database';
import routingInit from './src/routing';
import websocketInit from './src/websocket';

(async () => {
    const database = await databaseInit(config.database_connection_string);
    const router = routingInit(database);
    
    const server = http.createServer(router.server.bind(router));
    server.listen(config.port, () => console.log(`http server started on port ${config.port}`));

    websocketInit(database, server);
})();