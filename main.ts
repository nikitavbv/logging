import http from 'http';

import config from './src/config';
import { 
    HttpStream, 
    HttpMethod,
    url_starting_with,
    url_not_starting_with,
    strip_url_prefix,
    serve_static,
} from './src/api';

const stream = new HttpStream();

http.createServer(stream.server.bind(stream)).listen(config.port);

stream.forEach(console.log); // log each request

stream
    .filter(url_not_starting_with('/api/v1'))
    .forEach(serve_static('static'));

const apiStream = stream
    .filter(url_starting_with('/api/v1'))
    .map(strip_url_prefix('/api/v1'), new HttpStream()) as HttpStream;

apiStream.method(HttpMethod.GET).url('/').forEach(req => req.ok('hello'));
apiStream.method(HttpMethod.GET).url('/home').forEach(req => req.ok('home'));