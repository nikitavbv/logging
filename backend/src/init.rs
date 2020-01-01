use actix_web::{get, HttpResponse, Error};

use crate::auth::identity::Identity;

#[get("/init/")]
pub async fn init_index(identity: Identity) -> Result<HttpResponse, Error> {
    println!("{}", identity.user_email);
    Ok(HttpResponse::Ok().body("hello"))
}