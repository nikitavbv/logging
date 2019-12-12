import { HttpStream, HttpMethod, HttpRequest } from './api';
import { Client } from 'pg';
import { Query, QueryID } from './types';

type UserLogger = {
    logger: string,
};

type UserQuery = { query_id: QueryID; starred: boolean };

type Logger = {
};

const get_user_queries = async (database: Client, user_id: string): Promise<UserQuery[]> => {
    const result = await database.query('select * from user_queries WHERE user_id = $1', [ user_id ]);
    return result.rows as UserQuery[];
};

const get_user_loggers = async (database: Client, user_id: string): Promise<UserLogger[]> => {
    const result = await database.query('select * from logger_access WHERE "user" = $1', [ user_id ]);
    return result.rows as UserLogger[];
};

const get_user_query = async (database: Client, query_id: string): Promise<Query[]> => {
    return (await database.query('select * from queries where id = $1', [ query_id ]))
        .rows.map(r => r as Query);
};

const get_user_logger = async (database: Client, logger_id: string): Promise<Logger[]> => {
    return (await database.query('select id, name, retention from loggers where id = $1', [ logger_id ]))
        .rows.map(r => r as Logger);
};

const init_handler = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        req.unauthorized('unauthorized');
        return;
    }

    const user_queries = await get_user_queries(database, req.auth.user_id);
    const user_loggers = await get_user_loggers(database, req.auth.user_id);
    const queries = await Promise.all(user_queries.map(query => get_user_query(database, query.query_id)));
    const loggers = await Promise.all(user_loggers.map(logger => get_user_logger(database, logger.logger)));

    req.ok({ 
        'status': 'ok',
        user_queries,
        queries,
        user_loggers,
        loggers,
    });
};

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.GET).forEach(init_handler.bind({}, database));
};