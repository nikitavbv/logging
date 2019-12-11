import { Client } from "pg";
import { HttpRequest } from "../api";
import { AssertionError } from "assert";

export const add_user = async (database: Client, req: HttpRequest) => {
    if (req.auth === undefined) {
        throw new AssertionError({ message: 'auth is expected '});
    }

    const loggerID = req.body.logger_id;
    const userToAdd = req.body.email;

    await database.query('insert into logger_access (logger, "user") values ($1, $2)', [loggerID, userToAdd]);

    req.ok({});
};