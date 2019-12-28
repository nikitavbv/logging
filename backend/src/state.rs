use actix;

use crate::database::actor::Database;

#[derive(Clone)]
pub struct AppState {
    pub database: actix::Addr<Database>,
}