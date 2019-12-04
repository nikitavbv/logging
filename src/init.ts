import { HttpStream, HttpMethod, HttpRequest } from './api';
import { Client } from 'pg';

const init_handler = (req: HttpRequest) => {
    req.ok({ 'status': 'ok' });
};

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.GET).forEach(init_handler.bind({}));
};