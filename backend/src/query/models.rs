use uuid::Uuid;
use serde_derive::Serialize;

#[derive(Serialize)]
pub struct UserQuery {
    pub query_id: Uuid,
}