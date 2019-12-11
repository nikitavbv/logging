import { server, request, IMessage, connection } from 'websocket';
import { Server } from 'http';
import uuid from 'uuid';
import { Client } from 'pg';
import { hash_api_key } from './logger';

type LogIngressMessage = {
    entries: LogIngressEntry[],
};

type LogIngressEntry = {
    service_name: string,
    hostname: string,
    timestamp: string,
    tag: LogTag,
    data: any,
};

export type LogTag = 'debug' | 'info' | 'warn' | 'error';

const authorizedLoggers: any = {};

export default (database: Client, httpServer: Server) => {
    const wsServer = new server({
        httpServer
    });

    wsServer.on('request', onRequest(database));
};

const onRequest = (database: Client) => (request: request) => {
    const connection = request.accept('logging', request.origin);
    const connection_id = uuid.v4();
    console.log('new ws connection accepted:', connection_id);

    connection.on('message', onMessage(database).bind({}, connection_id, connection));

    connection.on('close', () => console.log('ws connection closed'));
};

const onMessage = (database: Client) => async (connection_id: string, connection: connection, message: IMessage) => {
    if (message.utf8Data === undefined) {
        return;
    }

    const msg = JSON.parse(message.utf8Data);

    switch (msg.action) {
        case 'auth':
            if (msg.api_key !== undefined) {
                authorizedLoggers[connection_id] = await get_logger_id_by_api_key(database, msg.api_key);
                connection.send(JSON.stringify({ 'action': 'auth.success' }));         
            }
            break;
        case 'log':
            await process_log_ingress(database, authorizedLoggers[connection_id], msg as LogIngressMessage);
            break;
        default:
            console.error('unknown message:', msg);
    }
};

const get_logger_id_by_api_key = async (database: Client, api_key: string): Promise<string | undefined> => {
    const res = await (database.query(
        'SELECT id FROM loggers WHERE api_key = $1 LIMIT 1',
        [hash_api_key(api_key)]
    ));

    if (res.rows.length === 0) {
        return undefined;
    }

    return (res.rows[0]['id'] as string);
}

const get_logger_retention = async (database: Client, logger_id: string): Promise<number> => {
    return (await database.query('select retention from loggers where id = $1', [ logger_id ])).rows[0].retention as number * 60 * 60;
};

const process_log_ingress = async (database: Client, logger_id: string, message: LogIngressMessage) => {
    const retention = await get_logger_retention(database, logger_id);

    await Promise.all(message.entries.map(entry => save_log_entry(database, logger_id, entry, retention)));
};

const save_log_entry = async (database: Client, logger_id: string, entry: LogIngressEntry, retention: number) => {
    await database.query(
        'INSERT INTO log (logger, service_name, hostname, timestamp, data, tag, delete_at) VALUES ($1, $2, $3, $4, $5, $6, current_timestamp + $7)',
        [logger_id, entry.service_name, entry.hostname, entry.timestamp, JSON.stringify(entry.data), entry.tag, retention]
    ).catch(e => console.error('failed to save log to database:', e));
}
