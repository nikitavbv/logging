extern crate deno;

mod auth;
mod config;
mod database;
mod js;
mod state;

use std::io::{Error, ErrorKind};

use actix_web::{App, HttpServer};

use crate::database::database::connect;
use crate::auth::auth_index;

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8081;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let database = connect()
        .await
        .map_err(|err| Error::new(ErrorKind::Other, err))?;
 
    HttpServer::new(move || App::new()
        .data(database.clone())
        .service(auth_index)
    )
        .bind(bind_address())?
        .run()
        .await
}

fn bind_address() -> String {
    format!("{}:{}", HOST, PORT)
}
