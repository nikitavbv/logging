import config from './config';

import { 
    HttpStream, 
    HttpMethod,
    url_not_starting_with,
    serve_static,
} from './api';

import authInit from './auth';

export default (): HttpStream => {
    const stream = new HttpStream();
    stream
        .filter(url_not_starting_with('/api/v1'))
        .forEach(serve_static(config.static_dir, '/'));

    const apiStream = stream.url_prefix_stream('/api/v1');

    apiStream.method(HttpMethod.GET).url('/').forEach(req => req.ok('api root'));
    authInit(apiStream.url_prefix_stream('/auth'));

    return stream;
};