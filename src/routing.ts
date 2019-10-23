import config from './config';

import { 
    HttpStream, 
    HttpMethod,
    url_starting_with,
    url_not_starting_with,
    strip_url_prefix,
    serve_static,
} from './api';

export default (): HttpStream => {
    const stream = new HttpStream();
    stream
        .filter(url_not_starting_with('/api/v1'))
        .forEach(serve_static(config.static_dir, '/'));

    const apiStream = stream
        .filter(url_starting_with('/api/v1'))
        .map(strip_url_prefix('/api/v1'), new HttpStream()) as HttpStream;

    apiStream.method(HttpMethod.GET).url('/').forEach(req => req.ok('api root'));

    const authStream = apiStream.filter(url_starting_with('/auth'))
        .map(strip_url_prefix('/auth'), new HttpStream()) as HttpStream;

    return stream;
};