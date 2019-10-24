import { AssertionError } from 'assert';

import uuid from 'uuid';
import { Client } from 'pg';

import { HttpStream, HttpMethod, HttpRequest } from "./api";

const logging_context = {};

const create_logger = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected' });
    }

    const name = req.body.name;
    const id = uuid();

    const user_id = req.auth.user_id;

    await database.query('INSERT INTO loggers (id, user_id, name) VALUES ($1, $2, $3)', [ id, user_id, name ]);

    req.ok({
        logger_id: id
    });
};

export default (stream: HttpStream, database: Client) => {
    stream.url('/').method(HttpMethod.POST).forEach(create_logger.bind(logging_context, database));
};