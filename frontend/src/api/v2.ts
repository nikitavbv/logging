export function api_request(url: string, method: string = 'GET', data?: any): Promise<any | undefined> {
    return new Promise((resolve, _) => {
        const req = new XMLHttpRequest();
        req.open(method, `http://localhost:8080/api/v1/${url}`);
        if (data !== undefined) {
            req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            data = JSON.stringify(data);
        }
        req.setRequestHeader('x-api-token', localStorage.authToken);
        req.setRequestHeader('Accept', 'application/json;');
        req.send(data);

        req.onload = () => {
            if (req.status === 401) {
                // window.location.href = '/auth';
                return;
            }
            resolve({ status: req.status, body: JSON.parse(req.responseText) })
        };
    });
};
