use std::env;

pub fn get_app_secret() -> String {
    env::var("APP_SECRET").ok().unwrap_or("app_secret".to_string())
}

pub fn get_postgres_username() -> String {
    env::var("POSTGRES_USER").ok().unwrap_or("logging_dev_user".to_string())
}

pub fn get_postgres_password() -> String {
    env::var("POSTGRES_PASSWORD").ok().unwrap_or("logging_dev_password".to_string())
}

pub fn get_postgres_host() -> String {
    env::var("POSTGRES_HOST").ok().unwrap_or("localhost".to_string())
}

pub fn get_postgres_port() -> u16 {
    env::var("POSTGRES_PORT").ok()
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(5432)
}

pub fn get_postgres_db() -> String {
    env::var("POSTGRES_DB").ok().unwrap_or("logging".to_string())
}
