use actix_web::{post, HttpResponse, Error};
use actix_web::web::{Data, Path, Json};
use serde_derive::Deserialize;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::logger::models::LoggerIDPath;

#[derive(Deserialize)]
struct ChangeUserAccessRequest {
    email: String
}

#[post("/user/add")]
pub async fn add_logger_user(
    database: Data<Database>,
    _identity: Identity,
    logger_id: Path<LoggerIDPath>,
    req: Json<ChangeUserAccessRequest>
) -> Result<HttpResponse, Error> {
    sqlx::query!(
        "insert into logger_access (logger, \"user\") values ($1, $2) returning logger",
        logger_id.logger_id,
        req.email
    ).fetch_one(&mut database.as_ref());

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}

#[post("/user/remove")]
pub async fn remove_logger_user(
    database: Data<Database>,
    _identity: Identity,
    logger_id: Path<LoggerIDPath>,
    req: Json<ChangeUserAccessRequest>
) -> Result<HttpResponse, Error> {
    sqlx::query!(
        "delete from logger_access where logger = $1 and \"user\" = $2 returning logger",
        logger_id.logger_id,
        req.email
    ).fetch(&mut database.as_ref());

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}