import { Client } from 'pg';

import { 
    HttpStream, 
    HttpMethod, 
    HttpRequest,
} from './api';
import { hash_api_key } from './logger';

export type LogIngressRequest = {
    api_key: string,
    entries: LogEntry[],
}

export type LogEntry = {
    service_name: string,
    hostname: string,
    timestamp: string,
    tag: LogTag,
    data: any,
};

export type LogTag = 'debug' | 'info' | 'warn' | 'error';

const log_context = {};

function handle_log_ingress(database: Client, req: HttpRequest) {
    const data = req.body as LogIngressRequest;

    get_logger_id_by_api_key(database, data.api_key)
        .then((logger_id: string | undefined) => {
            if (logger_id === undefined) {
                return req.not_found({ status: 'logger_not_found' });
            }

            data.entries.forEach(save_log_entry.bind(log_context, database, logger_id));
            req.ok({ status: 'ok' });
        })
        .catch(() => req.internal_error());
}

function save_log_entry(database: Client, logger_id: string, entry: LogEntry) {
    database.query(
        'INSERT INTO log (logger, service_name, hostname, timestamp, data, tag) VALUES ($1, $2, $3, $4, $5, $6)',
        [logger_id, entry.service_name, entry.hostname, entry.timestamp, JSON.stringify(entry.data), entry.tag]
    ).catch(e => console.error('failed to save log to database:', e));
}

async function get_logger_id_by_api_key(database: Client, api_key: string): Promise<string | undefined> {
    const res = await (database.query(
        'SELECT id FROM loggers WHERE api_key = $1 LIMIT 1',
        [hash_api_key(api_key)]
    ));

    if (res.rows.length === 0) {
        return undefined;
    }

    return (res.rows[0]['id'] as string);
}

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.POST).forEach(handle_log_ingress.bind(log_context, database));
};