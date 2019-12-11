import vm from 'vm';

import { Client } from 'pg';
import uuid from 'uuid';

import { HttpStream, HttpMethod, HttpRequest } from './api';
import { Stream } from './stream';
import { Query } from './types';

type QueryRunRequest = {
    id: string,
};

type SaveQueryRequest = {
    name: string,
    code: string,
};

const save_query_user = async (database: Client, query_id: string, user_id: string) => {
    await database.query('insert into user_queries (query_id, user_id) values ($1, $2)', [query_id, user_id]);
};

const get_query_users = async (database: Client, query_id: string): Promise<string[]> => {
    return (
        await database.query('select user_id from user_queries where query_id = $1', [ query_id ])
    ).rows.map(row => row[0] as string);
};

/*const delete_query = async (database: Client, query_id: string) => {
    return (
        await database.query('delete from queries where id = $1', [ query_id ])
    );
};*/

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
        save_query_user(database, id, user_id),
    ]);
    req.ok({
        status: 'ok',
        query_id: id
    });
}

const get_query_by_id = async (database: Client, query_id: string): Promise<Query | undefined> => {
    const res = await database.query('select * from queries where id = $1 limit 1', [query_id]);

    if (res.rowCount === 0) {
        return undefined;
    }

    return res.rows[0] as Query;
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

const run_query = async (database: Client, req: HttpRequest) => {
    const body = req.body as QueryRunRequest;
    const query = await get_query_by_id(database, body.id);

    const users = await get_query_users(database, body.id);

    if (req.auth === undefined || !users.indexOf(req.auth.user_id)) {
        req.unauthorized('unauthorized');
        return;
    }

    if (query === undefined) {
        req.not_found('query with this id not found');
        return;
    }

    const query_context = {
        Object,

        service: select_service(database)
    };
    const result: any[] = [];
    const ctx = vm.createContext(query_context);
    const stream = vm.runInContext(query.code, ctx);

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

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.POST).forEach(save_query.bind({}, database));
    stream.url('/run').method(HttpMethod.POST).forEach(run_query.bind({}, database));
};