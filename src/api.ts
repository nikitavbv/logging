import http from 'http';

import { Stream } from './stream';

export class HttpRequest {

    constructor(
        public url: string, 
        public method: HttpMethod,
        private callback: (status: HttpStatus, body: HttpBody) => void,
    ) {}

    ok = (body: HttpBody) => this.callback(HttpStatus.OK, body);
};

export type HttpBody = any;

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

export enum HttpStatus {
    OK,
}

export class HttpStream extends Stream<HttpRequest> {

    server(req: http.IncomingMessage, res: http.ServerResponse) {
        const request = to_http_request(req, res);
        if (request === undefined) {
            res.writeHead(400, {
                'Content-Type': 'text/plain' 
            });
            res.end('invalid request.');
            return;
        }

        this.push(request);
    }

    method(method: HttpMethod): HttpStream {
        return this.filter(req => req.method === method, new HttpStream()) as HttpStream;
    }

    url(url: string): HttpStream {
        return this.filter(req => this.compare_url(url, req.url), new HttpStream()) as HttpStream;
    }

    private compare_url(rule: string, actual: string) {
        if (actual === '') {
            actual = '/';
        }

        return rule === actual;
    }
}

function get_method(name: string): HttpMethod | undefined {
    switch (name.toLowerCase()) {
        case 'get':
            return HttpMethod.GET;
        case 'post':
            return HttpMethod.POST;
        case 'put':
            return HttpMethod.PUT;
        case 'delete':
            return HttpMethod.DELETE;
        default:
            return undefined;
    }
}

function http_status_to_code(status: HttpStatus): number {
    switch (status) {
        case HttpStatus.OK:
            return 200;
    }
}

export const to_http_request = (req: http.IncomingMessage, res: http.ServerResponse): HttpRequest | undefined => {
    if (req.method === undefined) {
        return undefined;
    }

    const method = get_method(req.method);
    if (method === undefined) {
        return undefined;
    }

    const path = req.url;
    if (path === undefined) {
        return undefined;
    }

    const callback = (status: HttpStatus, body: HttpBody) => {
        res.writeHead(http_status_to_code(status));
        res.end(body);
    };

    return new HttpRequest(path, method, callback);
}