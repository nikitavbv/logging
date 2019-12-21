use crate::config::{
    get_postgres_host,
    get_postgres_port,
    get_postgres_username,
    get_postgres_password,
    get_postgres_db
};

pub fn get_connection_string() -> String {
    format!(
        "host={} port={} user={} password={} dbname={}",
        get_postgres_host(),
        get_postgres_port(),
        get_postgres_username(),
        get_postgres_password(),
        get_postgres_db()
    )
}