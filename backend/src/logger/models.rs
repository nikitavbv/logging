use uuid::Uuid;
use serde_derive::Serialize;

#[derive(Serialize)]
pub struct UserLogger {
    pub logger_id: Uuid,
}