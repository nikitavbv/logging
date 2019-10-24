import { HttpStream, HttpMethod, HttpRequest } from "./api";

const create_collector = (req: HttpRequest) => {
    console.log(req);
};

export default (stream: HttpStream) => {
    stream.url('/').method(HttpMethod.POST).forEach(create_collector);
};