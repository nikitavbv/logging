use std::iter::Iterator;

use actix_web::{get, HttpResponse, Error, web::Data};
use futures::prelude::*;
use futures::stream::Stream;
use futures::future::{ready, join};
use serde_derive::Serialize;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::query::models::UserQuery;
use crate::logger::models::UserLogger;

#[derive(Serialize)]
struct InitResponse {
    user_queries: Vec<UserQuery>,
    user_loggers: Vec<UserLogger>,
}

#[get("/init/")]
pub async fn init_index(database: Data<Database>, identity: Identity) -> Result<HttpResponse, Error> {
    let (
        user_queries,
        user_loggers
    ) = join(
        get_user_queries(&mut database.as_ref().clone(), identity.clone()),
        get_user_loggers(&mut database.as_ref().clone(), identity.clone())
    ).await;

    Ok(HttpResponse::Ok().json(InitResponse {
        user_queries,
        user_loggers
    }))
}

async fn get_user_queries(database: &mut Database, identity: Identity) -> Vec<UserQuery> {
    sqlx::query!("select * from user_queries where user_id = $1", identity.user_email)
        .fetch(database)
        .filter_map(|res| ready(res.ok().map(|v| UserQuery {
            query_id: v.query_id,
        })))
        .collect::<Vec<UserQuery>>()
        .await
}

async fn get_user_loggers(database: &mut Database, identity: Identity) -> Vec<UserLogger> {
    sqlx::query!("select * from logger_access where \"user\" = $1", identity.user_email)
        .fetch(database)
        .filter_map(|res| ready(res.ok().map(|v| UserLogger {
            logger_id: v.logger,
        })))
        .collect::<Vec<UserLogger>>()
        .await
}
