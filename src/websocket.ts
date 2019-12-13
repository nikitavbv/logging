import vm from 'vm';

import { server, request, IMessage, connection } from 'websocket';
import { Server } from 'http';
import uuid from 'uuid';
import { Client } from 'pg';
import { hash_api_key } from './logger';
import { Stream } from './stream';

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

const service_streams: any = {};

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
        case 'query':
            run_query(database, connection, msg.code);
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
    if (service_streams[entry.service_name] !== undefined) {
        service_streams[entry.service_name].push(entry);
    }

    await database.query(
        'INSERT INTO log (logger, service_name, hostname, timestamp, data, tag, delete_at) VALUES ($1, $2, $3, $4, $5, $6, current_timestamp + $7)',
        [logger_id, entry.service_name, entry.hostname, entry.timestamp, JSON.stringify(entry.data), entry.tag, retention]
    ).catch(e => console.error('failed to save log to database:', e));
}

const select_service = (database: Client) => (service_name: string): Stream<any> => {
    const stream = new Stream<any>();
    database.query('SELECT service_name, hostname, timestamp, data, tag FROM log WHERE service_name = $1 ORDER BY timestamp desc', [service_name])
        .then(res => {
            res.rows.forEach(row => {
                row.data = row.data;
                stream.push(row);
            });
        })
        .catch(console.error);

    service_streams[service_name] = stream;

    return stream;
};

const run_query = async (database: Client, connection: connection, code: string) => {
    const query_context = {
        Object,

        service: select_service(database)
    };
    const ctx = vm.createContext(query_context);
    const stream = vm.runInContext(code, ctx);

    console.log(stream);

    if (stream.forEach) {
        (stream as Stream<any>).forEach(r => {
            connection.send(JSON.stringify({
                action: 'result.stream',
                item: r,
            }));
        });
    } else if(stream.get) {
        stream.map((v: any) => connection.send(JSON.stringify({
            action: 'result.single',
            item: v,
        })));
    } else {
        connection.send(JSON.stringify({
            action: 'result.single',
            item: stream,
        }));
    }
};