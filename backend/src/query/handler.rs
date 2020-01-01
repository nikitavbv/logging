use actix_web::{post, HttpResponse, Error, web::Data, web::Json};
use futures::future::join;

use crate::auth::identity::Identity;
use crate::database::database::Database;
use crate::query::models::Query;

#[post("/")]
pub async fn save_query(
    database: Data<Database>,
    identity: Identity,
    query: Json<Query>
) -> Result<HttpResponse, Error> {
    join(
        sqlx::query!("insert into user_queries (query_id, user_id) values ($1, $2) returning query_id", query.id, identity.user_email)
            .fetch_one(&mut database.get_ref().clone()),
        sqlx::query!("insert into queries (id, name, code) values ($1, $2, $3) returning id", query.id, query.name, query.code)
            .fetch_one(&mut database.get_ref().clone())
    ).await;

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}

#[post("/update")]
pub async fn update_query(
    database: Data<Database>,
    identity: Identity,
    query: Json<Query>
) -> Result<HttpResponse, Error> {
    join(
        sqlx::query!(
            "update user_queries set starred = $1 where query_id = $2 and user_id = $3 returning query_id",
            query.starred,
            query.id,
            identity.user_email,
        ).fetch_one(&mut database.get_ref().clone()),
        sqlx::query!(
            "update queries set name = $1, code = $2 where id = $3 returning id",
            query.name,
            query.code,
            query.id
        ).fetch_one(&mut database.get_ref().clone())
    ).await;

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}

#[post("/delete")]
pub async fn delete_query(
    database: Data<Database>,
    identity: Identity,
    query: Json<Query>
) -> Result<HttpResponse, Error> {
    sqlx::query!(
        "delete from user_queries where query_id = $1 and user_id = $2 returning query_id",
        query.id,
        identity.user_email
    ).fetch_one(&mut database.as_ref().clone()).await;

    Ok(HttpResponse::Ok().body(json!({
        "status": "ok"
    })))
}