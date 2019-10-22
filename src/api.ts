import http from 'http';
import path from 'path';
import fs from 'fs';

import { Stream } from './stream';

export class HttpRequest {

    constructor(
        public url: string, 
        public method: HttpMethod,
        public callback: (status: HttpStatus, body: HttpBody) => void,
    ) {}

    ok = (body: HttpBody) => this.callback(HttpStatus.OK, body);
    not_found = (body: HttpBody) => this.callback(HttpStatus.NOT_FOUND, body);
    internal_error = () => this.callback(HttpStatus.INTERNAL_ERROR, 'internal server error');
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
    NOT_FOUND,
    INTERNAL_ERROR,
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
        case HttpStatus.NOT_FOUND:
            return 404;
        case HttpStatus.INTERNAL_ERROR:
            return 500;
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

export const url_starting_with = (prefix: string) => (req: HttpRequest): boolean =>
    req.url.startsWith(prefix);

export const url_not_starting_with = (prefix: string) => (req: HttpRequest): boolean =>
    !req.url.startsWith(prefix);

export const strip_url_prefix = (prefix: string) => (req: HttpRequest): HttpRequest =>
    new HttpRequest(req.url.replace(prefix, ''), req.method, req.callback);

function serve_file(req: HttpRequest, file_path: string) {
    fs.exists(file_path, exists => {
        if (!exists) {
            req.not_found(`Not found: ${req.url}`);
            return;
        }

        fs.readFile(file_path, 'utf8', (err, data) => {
            if (err) {
                console.error('failed to read static file:', err);
                req.internal_error();
                return;
            }

            req.ok(data);
        });
    });
}

export const serve_static = (static_resources_path: string) => (req: HttpRequest) => {
        const dir = static_resources_path.endsWith('/') ? static_resources_path : `${static_resources_path}/`;
    
    const url = req.url.endsWith('/') ? `${req.url}index.html` : req.url;

    const file_path = path.join(dir, url);
    
    if (!file_path.startsWith(dir)) {
        return serve_file(req, path.join(dir, 'index.html'));
    }

    return serve_file(req, file_path);
};