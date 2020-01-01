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