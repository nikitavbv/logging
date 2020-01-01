use uuid::Uuid;
use serde_derive::Serialize;

#[derive(Serialize)]
pub struct Logger {
    pub id: Uuid,
    pub name: String,
    pub api_key: String,
}