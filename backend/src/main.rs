extern crate deno;
extern crate custom_error;
extern crate frank_jwt;
#[macro_use] extern crate serde_json;

mod auth;
mod config;
mod init;
mod database;
mod logger;
mod js;
mod query;
mod state;

use std::io::{Error, ErrorKind};

use actix_web::{App, HttpServer, web::scope};

use crate::database::database::connect;
use crate::auth::handler::auth_index;
use crate::init::init_index;
use crate::query::handler::{save_query, update_query};

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
        .service(init_index)
        .service(scope("query")
            .service(save_query)
            .service(update_query)
        )
    )
        .bind(bind_address())?
        .run()
        .await
}

fn bind_address() -> String {
    format!("{}:{}", HOST, PORT)
}
