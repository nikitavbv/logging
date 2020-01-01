use sqlx::PgPool;

use sqlx::pool::Pool;
use sqlx::postgres::Postgres;
use sqlx::error::Error as SQLXError;

use crate::config::{
    get_postgres_host,
    get_postgres_port,
    get_postgres_username,
    get_postgres_password,
    get_postgres_db
};

pub fn get_connection_string() -> String {
    format!(
        "postgres://{}:{}@{}:{}/{}",
        get_postgres_username(),
        get_postgres_password(),
        get_postgres_host(),
        get_postgres_port(),
        get_postgres_db()
    )
}

pub async fn connect() -> Result<Pool<Postgres>, SQLXError> {
    PgPool::new(&get_connection_string()).await
}