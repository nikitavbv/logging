import { Client } from "pg";

export const retentionInit = (database: Client) => {
    deleteOldRecords(database);
    setInterval(deleteOldRecords.bind({}, database), 1000 * 60 * 60);
};

const deleteOldRecords = (database: Client) => {
    console.log('deleting old logs');
    database.query('delete from log where delete_at < current_timestamp');
};