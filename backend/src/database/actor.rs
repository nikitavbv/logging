use actix;
use tokio_postgres::Client;

use crate::database::database::connect;

pub struct Database {
    client: Option<Client>,
}

impl actix::Actor for Database {
    type Context = actix::Context<Self>;
}

pub fn connect(connection_string: &str) -> actix::addr<Database> {
    let db = connect();
}