import { Client } from 'pg';

export default async (connection_string: string): Promise<Client> => {
    const client = new Client(connection_string);
    await client.connect();
    return client;
};