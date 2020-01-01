use actix_web::{web::Data, web::Path, HttpResponse, Error, post, delete};
use futures::future::join;
use uuid::Uuid;
use serde_derive::Deserialize;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::logger::models::Logger;

#[derive(Deserialize)]
struct LoggerIDPath {
    logger_id: Uuid,
}

#[post("/")]
pub async fn save_logger(
    database: Data<Database>,
    identity: Identity,
    logger: Data<Logger>
) -> Result<HttpResponse, Error> {
    join(
        sqlx::query!(
            "insert into logger_access (logger, \"user\") values ($1, $2) returning logger",
            logger.id,
            identity.user_email
        ).fetch_one(&mut database.as_ref().clone()),
        sqlx::query!(
            "insert into loggers (id, api_key, name) values ($1, $2, $3) returning id",
            logger.id,
            logger.api_key,
            logger.name
        ).fetch_one(&mut database.as_ref().clone())
    ).await;

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}

#[delete("/{logger_id}")]
pub async fn delete_logger(
    database: Data<Database>,
    identity: Identity,
    logger_id: Path<LoggerIDPath>
) -> Result<HttpResponse, Error> {
    join(
        sqlx::query!(
            "delete from logger_access where logger = $1 returning logger",
            logger_id.logger_id
        ).fetch_one(&mut database.as_ref().clone()),
        sqlx::query!(
            "delete from loggers where id = $1 returning id",
            logger_id.logger_id
        ).fetch_one(&mut database.as_ref().clone())
    ).await;

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}