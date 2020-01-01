use uuid::Uuid;
use serde_derive::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Query {
    pub id: Uuid,
    pub name: String,
    pub code: String,
    pub starred: bool,
}