extern crate deno_core;
extern crate custom_error;
extern crate frank_jwt;
#[macro_use] extern crate serde_json;

mod auth;
mod config;
mod cors;
mod init;
mod database;
mod logger;
mod jobs;
mod js;
mod query;
mod state;

use std::io::{Error, ErrorKind};

use actix_web::{App, HttpServer, web::scope, web, HttpResponse, HttpRequest, http::Method};
use actix::Actor;

use crate::database::database::connect;
use crate::auth::handler::auth_index;
use crate::init::init_index;
use crate::query::handler::{save_query, update_query, delete_query};
use crate::logger::handler::{save_logger, update_logger, delete_logger};
use actix_web::middleware::{errhandlers::ErrorHandlers, Logger};
use crate::jobs::retention::RetentionJob;
use crate::js::evaluate_javascript;

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8081;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let database = connect()
        .await
        .map_err(|err| Error::new(ErrorKind::Other, err))?;

    RetentionJob {
        database: database.clone(),
    }.start();

    HttpServer::new(move || {
        App::new()
            .data(database.clone())
            .wrap(cors::Cors)
            .service(auth_index)
            .service(init_index)
            .service(scope("query")
                .service(save_query)
                .service(update_query)
                .service(delete_query)
            )
            .service(scope("logger")
                .service(save_logger)
                .service(update_logger)
                .service(delete_logger)
            )
    }
    )
        .bind(bind_address())?
        .run()
        .await
}

fn bind_address() -> String {
    format!("{}:{}", HOST, PORT)
}
