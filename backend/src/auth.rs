use actix_web::{get, Responder};

#[get("/auth/")]
pub async fn auth_index() -> impl Responder {
    "Hello World!"
}