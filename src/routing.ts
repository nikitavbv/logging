import { Client } from 'pg';

import config from './config';

import { 
    HttpStream, 
    HttpMethod,
    url_not_starting_with,
    serve_static,
} from './api';

import authInit from './auth';
import loggerInit from './logger';

export default (database: Client): HttpStream => {
    const stream = new HttpStream();
    stream
        .filter(url_not_starting_with('/api/v1'))
        .forEach(serve_static(config.static_dir, '/'));

    const apiStream = stream.url_prefix_stream('/api/v1');
    const authorizedStream = apiStream.auth();

    apiStream.method(HttpMethod.GET).url('/').forEach(req => req.ok('api root'));
    authInit(apiStream.url_prefix_stream('/auth'));
    loggerInit(authorizedStream.url_prefix_stream('/logger'), database);

    return stream;
};