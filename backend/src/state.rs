use actix;

use database::actor::Database;

pub struct AppState {
    pub database: actix::Addr<Database>,
}