use tokio_postgres;
use tokio_postgres::{Client, NoTls};

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

pub async fn connect() -> Client {
    tokio_postgres::connect(&get_connection_string(), NoTls).await.unwrap().0
}