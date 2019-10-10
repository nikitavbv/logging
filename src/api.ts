export type HttpRequest = {
    url: string
};

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

export type RouteHandler = (req: HttpRequest) => Promise<{}>;

export type Router = {
    get: (path: string, handler: RouteHandler) => Router;
    post: (path: string, handler: RouteHandler) => Router;
    put: (path: string, handler: RouteHandler) => Router;
    delete: (path: string, handler: RouteHandler) => Router;
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