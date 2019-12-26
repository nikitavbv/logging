#[macro_use] extern crate mozjs;

mod config;
mod database;
mod js;

use futures::IntoFuture;

use actix_web::{web, App, HttpServer, Responder, Error, HttpRequest};
use tokio::runtime::Runtime;

fn main() -> std::io::Result<()> {
    HttpServer::new(
        move || App::new()
            .service(web::resource("/").to_async(index_async))
    )
    .bind("127.0.0.1:8081")?
    .run()
}

fn index_async(req: HttpRequest) -> impl IntoFuture<Item = String, Error = Error> {
    Ok(format!("hello world!"))
}
