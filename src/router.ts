export type HttpRequest = {
    url: string
};

export enum HttpStatusCode {
    OK,
    NOT_FOUND,
    INTERNAL_ERROR,
    // ...
}

export type HttpResponse<T> = {
    body: T,
    status_code: HttpStatusCode
};

export type RouteHandler<T> = (req: HttpRequest) => HttpResponse<T>;

export type RouteSet<T> = {
    [key: string]: RouteHandler<T>
}
