use uuid::Uuid;
use serde_derive::Serialize;

#[derive(Serialize)]
pub struct Query {
    pub id: Uuid,
    pub name: String,
    pub code: String,
}