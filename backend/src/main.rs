#[macro_use] extern crate mozjs;

mod config;
mod database;
mod js;
mod state;

use futures::IntoFuture;

use actix::System;
use actix_web::{web, App, HttpServer, Responder, Error, HttpRequest};

use crate::database::actor::connect;
use crate::database::database::get_connection_string;
use crate::state::AppState;

fn main() {
    let host = "127.0.0.1";
    let port = 8081;
    let bind_address = format!("{}:{}", host, port);

    let sys = System::new("logging");
    let database = connect(get_connection_string());

    let state = AppState {
        database,
    };

    HttpServer::new(
        move || App::with_state(state)
            .service(web::resource("/").to_async(index_async))
    )
    .bind(bind_address)?
    .start();

    println!("Started sserver on {}", bind_address);
    let _ = sys.run()
}

fn index_async(req: HttpRequest) -> impl IntoFuture<Item = String, Error = Error> {
    Ok(format!("hello world!"))
}
