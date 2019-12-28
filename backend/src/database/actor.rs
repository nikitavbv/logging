use actix;
use tokio_postgres::Client;

use actix::prelude::*;

use crate::database::database;

pub struct Database {
    client: Option<Client>,
}

impl Actor for Database {
    type Context = actix::Context<Self>;
}

pub async fn connect() -> actix::Addr<Database> {
    Database {
        client: Some(database::connect().await),
    }.start()
}