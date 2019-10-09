export type HttpRequest = {
    url: string
};

export enum HttpStatusCode {
    OK,
    NOT_FOUND,
    INTERNAL_ERROR,
    // ...
}

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

export type HttpResponse = {
    body: {},
    status_code: HttpStatusCode
};

export type RouteHandler = (req: HttpRequest) => HttpResponse;

export type RoutingRules = {
    [path: string]: {
        [method: string]: RouteHandler
    }
}