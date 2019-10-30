import { AssertionError } from 'assert';

import uuid from 'uuid';
import { Client } from 'pg';
import crypto from 'crypto';

import { HttpStream, HttpMethod, HttpRequest } from "./api";

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
    const user_id = req.auth.user_id;

    await Promise.all([
        database.query('INSERT INTO loggers (id, api_key, name) VALUES ($1, $2, $3, $4)', [ id, user_id, api_key_hash, name ]),
        database.query('INSERT INTO logger_access (logger, user) VALUES ($1, $2)', [ id, user_id ])
    ]);

    req.ok({
        logger_id: id,
        api_key
    });
};

const init = (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.GET).forEach(get_loggers.bind(logging_context, database));
    stream.url('/').method(HttpMethod.POST).forEach(create_logger.bind(logging_context, database));
};

export {
    hash_api_key,
    init
}
