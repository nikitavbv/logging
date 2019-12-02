import vm from 'vm';

import { Client } from 'pg';
import uuid from 'uuid';

import { HttpStream, HttpMethod, HttpRequest } from "./api";
import { Stream } from './stream';
import database from './database';

type QueryRequest = {
    query: string,  
};

type SaveQueryRequest = {
    name: string,
    code: string,
};

const select_service = (database: Client) => (service_name: string): Stream<any> => {
    const stream = new Stream<any>();
    database.query('SELECT service_name, hostname, timestamp, data, tag FROM log WHERE service_name = $1 ORDER BY timestamp desc', [service_name])
        .then(res => {
            res.rows.forEach(row => {
                row.data = JSON.parse(row.data);
                stream.push(row);
            });
        })
        .catch(console.error);

    return stream;
};

function run_query(database: Client, req: HttpRequest) {
    const body = req.body as QueryRequest;

    const query_context = {
        Object,

        service: select_service(database)
    };
    const result: any[] = [];
    const ctx = vm.createContext(query_context);
    const stream = vm.runInContext(body.query, ctx);

    console.log(stream);

    if (stream.forEach) {
        (stream as Stream<any>).forEach(r => {
            result.push(r);
        });
        setTimeout(() => req.ok(result), 2000);
    } else if(stream.get) {
        setTimeout(() => console.log(stream.get()), 2000);
        setTimeout(() => req.ok(stream.get()), 2000);
    } else {
        req.ok(stream);
    }
}

const save_query_user = async (database: Client, query_id: string, user_id: string) => {
    await database.query('insert into user_queries (query_id, user_id) values ($1, $2)', [query_id, user_id]);
};

const save_query = async (database: Client, req: HttpRequest) => {
    const body = req.body as SaveQueryRequest;
    if (req.auth === undefined) {
        req.unauthorized('unauthorized');
        return;
    }
    const user_id = req.auth.user_id;
    
    const id = uuid();
    await Promise.all([
        database.query('insert into queries (id, name, code) values ($1, $2, $3)', [id, body.name, body.code]),
        save_query_user(database, id, user_id);
    ]);
    req.ok({
        status: 'ok',
        query_id: id
    });
}

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.POST).forEach(save_query.bind({}, database));
    stream.url('/run').method(HttpMethod.POST).forEach(run_query.bind({}, database));
};