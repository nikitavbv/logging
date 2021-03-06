use uuid::Uuid;
use serde_derive::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Logger {
    pub id: Uuid,
    pub name: String,
    pub api_key: String,
}

#[derive(Deserialize)]
pub struct LoggerIDPath {
    pub logger_id: Uuid,
}
