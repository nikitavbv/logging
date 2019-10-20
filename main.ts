import http from 'http';

import config from './src/config';
import { HttpStream, HttpMethod } from './src/api';

const stream = new HttpStream();

http.createServer(stream.server.bind(stream)).listen(config.port);

stream.forEach(console.log); // log each request

stream.method(HttpMethod.GET).url('/').forEach(req => req.ok('hello'));
stream.method(HttpMethod.GET).url('/home').forEach(req => req.ok('home'));
