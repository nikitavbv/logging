import http from 'http';
import path from 'path';
import fs from 'fs';

import { Stream } from './stream';
import { AuthInfo, filter_authorization, map_authorization } from './auth';

export class HttpRequest {
    constructor(
        public url: string, 
        public method: HttpMethod,
        public body: HttpBody,
        public cookies: Cookies,
        public headers: HttpRequestHeaders,
        public callback: (status: HttpStatus, headers: HttpResponseHeaders, body: HttpBody) => void,
        public auth?: AuthInfo,
    ) {}

    ok = (body: HttpBody, head?: HttpResponseHeaders) => this.callback(HttpStatus.OK, head || {}, body);
    unauthorized = (body: HttpBody, head?: HttpResponseHeaders) => this.callback(HttpStatus.UNAUTHORIZED, head || {}, body);
    not_found = (body: HttpBody, head?: HttpResponseHeaders) => this.callback(HttpStatus.NOT_FOUND, head || {}, body);
    internal_error = (head?: HttpResponseHeaders) => this.callback(HttpStatus.INTERNAL_ERROR, head || {}, 'internal server error');
};

export type HttpBody = any;

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    OPTIONS,
}

export enum HttpStatus {
    OK,
    UNAUTHORIZED,
    NOT_FOUND,
    INTERNAL_ERROR,
}

export type HttpResponseHeaders = http.OutgoingHttpHeaders;

export type Cookies = any;

export type HttpRequestHeaders = http.IncomingHttpHeaders;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
};

export class HttpStream extends Stream<HttpRequest> {

    server(req: http.IncomingMessage, res: http.ServerResponse) {
        to_http_request(req, res).then(request => {
            if (request === undefined) {
                res.writeHead(400, {
                    'Content-Type': 'text/plain' 
                });
                res.end('invalid request.');
                return;
            }
    
            this.push(request);
        });
    }

    url_prefix_stream(url_prefix: string): HttpStream {
        return this.filter(url_starting_with(url_prefix))
            .map(strip_url_prefix(url_prefix), new HttpStream()) as HttpStream;
    }

    method(method: HttpMethod): HttpStream {
        return this.filter(req => req.method === method, new HttpStream()) as HttpStream;
    }

    url(url: string): HttpStream {
        return this.filter(req => this.compare_url(url, req.url), new HttpStream()) as HttpStream;
    }

    auth(): HttpStream {
        return this.filter(filter_authorization).map(map_authorization, new HttpStream()) as HttpStream;
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
        case 'options':
            return HttpMethod.OPTIONS;    
        default:
            return undefined;
    }
}

function http_status_to_code(status: HttpStatus): number {
    switch (status) {
        case HttpStatus.OK:
            return 200;
        case HttpStatus.UNAUTHORIZED:
            return 401;
        case HttpStatus.NOT_FOUND:
            return 404;
        case HttpStatus.INTERNAL_ERROR:
            return 500;
    }
}

async function read_post_body(req: http.IncomingMessage): Promise<HttpBody> {
    return new Promise((resolve, _) => {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

export const to_http_request = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<HttpRequest | undefined> => {
    if (req.method === undefined) {
        return Promise.resolve(undefined);
    }

    const method = get_method(req.method);
    if (method === undefined) {
        return Promise.resolve(undefined);
    }

    const path = req.url;
    if (path === undefined) {
        return Promise.resolve(undefined);
    }

    const body = method === HttpMethod.POST ?
        await read_post_body(req) : undefined;

    const cookies = req.headers.cookie !== undefined ? parse_cookie(req.headers.cookie as string) : undefined;
    
    const headers = req.headers;

    const callback = (status: HttpStatus, headers: HttpResponseHeaders, body: HttpBody) => {
        res.writeHead(http_status_to_code(status), { ...CORS_HEADERS, ...headers});

        if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
            body = JSON.stringify(body);
        }

        res.end(body);
    };

    return new HttpRequest(path, method, body, cookies, headers, callback);
}

export const url_starting_with = (prefix: string) => (req: HttpRequest): boolean =>
    req.url.startsWith(prefix);

export const url_not_starting_with = (prefix: string) => (req: HttpRequest): boolean =>
    !req.url.startsWith(prefix);

export const strip_url_prefix = (prefix: string) => (req: HttpRequest): HttpRequest =>
    new HttpRequest(req.url.replace(prefix, ''), req.method, req.body, req.cookies, req.headers, req.callback, req.auth);

const parse_cookie = (cookie: string): Cookies => {
    const cookies: Cookies = {};

    cookie.split(';')
        .map(s => s.trim())
        .forEach(cookie_item => {
            const spl = cookie_item.split('=');
            const key = spl[0];
            const value = spl[1];
            cookies[key] = value;
        });
    
    return cookies as Cookies
}

function serve_file(req: HttpRequest, file_path: string, not_found_path?: string) {
    fs.exists(file_path, exists => {
        if (!exists) {
            if (file_path === not_found_path || not_found_path === undefined) {
                req.not_found(`Not found: ${req.url}`);
                return;
            }

            return serve_file(req, not_found_path, not_found_path);
        }

        fs.readFile(file_path, (err, data) => {
            if (err) {
                console.error('failed to read static file:', err);
                req.internal_error();
                return;
            }

            req.ok(data);
        });
    });
}

function static_resource_path(static_resources_path: string, relative_path: string) {
    const dir = static_resources_path.endsWith('/') ? static_resources_path : `${static_resources_path}/`;
    const url = relative_path.endsWith('/') ? `${relative_path}index.html` : relative_path;
    return path.join(dir, url);
}

export const serve_static = (static_resources_path: string, not_found?: string) => (req: HttpRequest) => {
    const file_path = static_resource_path(static_resources_path, req.url);
    
    if (!file_path.startsWith(file_path)) {
        return serve_file(req, static_resource_path(static_resources_path, 'index.html'));
    }

    return serve_file(req, file_path, not_found === undefined ? undefined : static_resource_path(static_resources_path, not_found));
};