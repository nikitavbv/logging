import { AssertionError } from 'assert';

import uuid from 'uuid';
import { Client } from 'pg';
import crypto from 'crypto';

import { HttpStream, HttpMethod, HttpRequest } from "../api";
import { add_user, remove_user } from './user';

const logging_context = {};

const generate_api_key = (): Promise<string> => new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buffer) => {
        if (err) {
            reject(err);
        } else {
            resolve(buffer.toString('hex'));     
        }
    });
});

const hash_api_key = (api_key: string): string => {
    const hash = crypto.createHash('sha512');
    hash.update(api_key);
    return hash.digest('hex');
}

const get_loggers = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected'});
    }

    const user_id = req.auth.user_id;
    const result = await database.query('SELECT id, name FROM loggers WHERE user_id = $1', [ user_id ]);

    req.ok({
        loggers: result.rows,
    });
};

const create_logger = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected' });
    }

    const name = req.body.name;
    const api_key = await generate_api_key();
    const api_key_hash = await hash_api_key(api_key);
    const id = uuid();
    const user_email = req.auth.user_id;

    await Promise.all([
        database.query('INSERT INTO loggers (id, api_key, name) VALUES ($1, $2, $3)', [ id, api_key_hash, name ]),
        database.query('INSERT INTO logger_access (logger, "user") VALUES ($1, $2)', [ id, user_email ])
    ]);

    req.ok({
        logger_id: id,
        api_key
    });
};

const delete_logger = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected' });
    }

    const logger_id = req.url;

    await Promise.all([
        database.query('delete from loggers where id = $1', [ logger_id ]),
        database.query('delete from logger_access where logger = $1', [ logger_id ])
    ]);

    req.ok({});
};

const update_logger = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected' });
    }

    const logger_id = req.url;

    if (req.body.name !== undefined) {
        await database.query('update loggers set name = $1 where id = $2', [ req.body.name, logger_id ]);
    }

    if (req.body.retention !== undefined) {
        await database.query('update loggers set retention = $1 where id = $2', [ req.body.retention, logger_id ]);
    }

    req.ok({});
};

const init = (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.GET).forEach(get_loggers.bind(logging_context, database));
    stream.url('/').method(HttpMethod.POST).forEach(create_logger.bind(logging_context, database));
    stream.url_prefix_stream('/').method(HttpMethod.DELETE)
        .filter(r => r.url.indexOf('/') === -1).forEach(delete_logger.bind(logging_context, database));
    stream.url_prefix_stream('/').filter(r => r.url.length > 1 && r.url.indexOf('/') === -1)
        .forEach(update_logger.bind(logging_context, database));

    // user access
    stream.url('/user/add').method(HttpMethod.POST).forEach(add_user.bind(logging_context, database));
    stream.url('/user/remove').method(HttpMethod.POST).forEach(remove_user.bind(logging_context, database));
};

export {
    hash_api_key,
    init
}
