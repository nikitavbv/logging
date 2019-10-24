import { Client } from 'pg';

import { 
    HttpStream, 
    HttpMethod, 
    HttpRequest,
} from './api';

export type LogIngressRequest = {
    logger_id: string,
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
    data.entries.forEach(save_log_entry.bind(log_context, database, data.logger_id));
    req.ok({ status: 'ok' });
}

function save_log_entry(database: Client, logger_id: string, entry: LogEntry) {
    database.query(
        'INSERT INTO log (logger, service_name, hostname, timestamp, data, tag) VALUES ($1, $2, $3, $4, $5, $6)',
        [logger_id, entry.service_name, entry.hostname, entry.timestamp, JSON.stringify(entry.data), entry.tag]
    ).catch(e => console.error('failed to save log to database:', e));
}

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.POST).forEach(handle_log_ingress.bind(log_context, database));
};