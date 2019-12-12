import { Client } from 'pg';

import config from './config';

import { 
    HttpStream, 
    HttpMethod,
    url_not_starting_with,
    serve_static,
} from './api';

import authInit from './auth';
import logInit from './log';
import { init as loggerInit } from './logger';
import queryInit from './query';
import initInit from './init';

export default (database: Client): HttpStream => {
    const stream = new HttpStream();

    stream.method(HttpMethod.OPTIONS).forEach(r => r.ok({}, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
    }));

    stream
        .filter(url_not_starting_with('/api/v1'))
        .forEach(serve_static(config.static_dir, '/'));

    const apiStream = stream.url_prefix_stream('/api/v1');

    apiStream.method(HttpMethod.GET).url('/').forEach(req => req.ok('api root'));
    authInit(apiStream.url_prefix_stream('/auth'));

    logInit(apiStream.url_prefix_stream('/log'), database);
    loggerInit(apiStream.url_prefix_stream('/logger').auth(), database);
    initInit(apiStream.url_prefix_stream('/init').auth(), database);
    queryInit(apiStream.url_prefix_stream('/query').auth(), database);

    return stream;
};