#[macro_use] extern crate mozjs;

mod config;
mod database;
mod js;
mod state;

use futures::IntoFuture;

use actix::System;
use actix_web::{web, App, HttpServer, Error, HttpRequest};
use tokio::runtime::Runtime;

use crate::database::actor::connect;
use crate::state::AppState;

fn main() -> std::io::Result<()> {
    let host = "127.0.0.1";
    let port = 8081;
    let bind_address = format!("{}:{}", host, port);

    let mut runtime = Runtime::new().unwrap();
    let database = runtime.block_on(connect());

    let sys = System::new("logging");

    HttpServer::new(
        move || App::new()
            .data(AppState { database: database.clone() })
            .service(web::resource("/").to_async(index_async))
    )
    .bind(bind_address.clone())?
    .start();

    println!("Started server on {}", bind_address);
    let _ = sys.run();
    Ok(())
}

fn index_async(_req: HttpRequest) -> impl IntoFuture<Item = String, Error = Error> {
    Ok(format!("hello world!"))
}
