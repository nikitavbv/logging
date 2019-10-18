export type HttpRequest = {
    url: string,
    method: HttpMethod
};

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

export type RouteHandler = (req: HttpRequest) => Promise<{}>;

export type Router = {
    route: (req: HttpRequest) => Promise<{}>;
    get: (path: string, handler: RouteHandler) => Router;
    post: (path: string, handler: RouteHandler) => Router;
    put: (path: string, handler: RouteHandler) => Router;
    delete: (path: string, handler: RouteHandler) => Router;
}

export function filterMethod(method: HttpMethod, handler: RouteHandler): RouteHandler => {
    return async (req: HttpRequest) => {
        if (req.method !== method) {
            return;
        }

        return await handler(req);
    };
}

export function router(): Router {
    const routingRules = new Map<string, Map<HttpMethod, RouteHandler>>();

    const addRouteHandler = (
        path: string, 
        method: HttpMethod, 
        handler: RouteHandler
    ): Router => {
        const prevRules = routingRules.get(path) ||
            new Map<HttpMethod, RouteHandler>();
        prevRules.set(method, handler);
        return router;
    };

    const router: Router = {
        route: (req: HttpRequest): Promise<{}> => {
            const handler = routeHandlerFor(req);
            return handler(req);
        },

        get: (path: string, handler: RouteHandler): Router =>
            addRouteHandler(path, HttpMethod.GET, handler),

        post: (path: string, handler: RouteHandler): Router =>
            addRouteHandler(path, HttpMethod.POST, handler),
        
        put: (path: string, handler: RouteHandler): Router =>
            addRouteHandler(path, HttpMethod.PUT, handler),

        delete: (path: string, handler: RouteHandler): Router =>
            addRouteHandler(path, HttpMethod.DELETE, handler)
    };

    return router
}

export class HttpStream extends Stream<HttpRequest> {
}
