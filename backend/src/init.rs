use std::iter::Iterator;

use actix_web::{get, HttpResponse, Error, web::Data};
use futures::prelude::*;
use futures::stream::Stream;
use futures::future::{ready, join};
use serde_derive::Serialize;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::query::models::Query;
use crate::logger::models::Logger;

#[derive(Serialize)]
struct InitResponse {
    queries: Vec<Query>,
    loggers: Vec<Logger>,
}

#[get("/init/")]
pub async fn init_index(database: Data<Database>, identity: Identity) -> Result<HttpResponse, Error> {
    let (
        queries,
        loggers
    ) = join(
        get_user_queries(&mut database.as_ref().clone(), identity.clone()),
        get_user_loggers(&mut database.as_ref().clone(), identity.clone())
    ).await;

    Ok(HttpResponse::Ok().json(InitResponse {
        queries,
        loggers
    }))
}

async fn get_user_queries(database: &mut Database, identity: Identity) -> Vec<Query> {
    sqlx::query!(
        "select * from user_queries inner join queries on queries.id = user_queries.query_id where user_id = $1",
        identity.user_email
    )
        .fetch(database)
        .filter_map(|res| ready(res.ok().map(|v| Query {
            id: v.query_id,
            name: v.name,
            code: v.code,
            starred: v.starred,
        })))
        .collect::<Vec<Query>>()
        .await
}

async fn get_user_loggers(database: &mut Database, identity: Identity) -> Vec<Logger> {
    sqlx::query!(
        "select * from logger_access inner join loggers on loggers.id = logger_access.logger where \"user\" = $1",
        identity.user_email
    )
        .fetch(database)
        .filter_map(|res| ready(res.ok().map(|v| Logger {
            id: v.logger,
            name: v.name,
            api_key: v.api_key
        })))
        .collect::<Vec<Logger>>()
        .await
}
