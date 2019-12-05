import { HttpStream, HttpMethod, HttpRequest } from './api';
import { Client } from 'pg';
import { Query, QueryID } from './types';

const get_user_queries = async (database: Client, user_id: string): Promise<QueryID[]> => {
    const result = await database.query('select query_id from user_queries WHERE user_id = ?', [ user_id ]);
    return result.rows.map(r => r[0] as QueryID);
};

const get_user_query = async (database: Client, query_id: string): Promise<Query[]> => {
    return (await database.query('select * from queries where id = $1', [ query_id ]))
        .rows.map(r => r as Query);
};

const init_handler = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        req.unauthorized('unauthorized');
        return;
    }

    const user_queries = await get_user_queries(database, req.auth.user_id);
    const queries = await Promise.all(user_queries.map(query => get_user_query(database, query)));

    req.ok({ 
        'status': 'ok',
        'queries': queries,
    });
};

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.GET).forEach(init_handler.bind({}, database));
};