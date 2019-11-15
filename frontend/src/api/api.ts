export function api_request(input: RequestInfo, info?: RequestInit | undefined): Promise<Response | undefined> {
    return fetch(input, info)
        .then(res => {
            if (res.status === 401) {
                window.location.href = '/auth';
                return undefined;
            }

            return res;
        });
};