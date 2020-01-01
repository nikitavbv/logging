use actix_web::{web::Data, HttpResponse, Error, post};
use futures::future::join;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::logger::models::Logger;

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
