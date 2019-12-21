use std::env;

pub fn get_postgres_username() -> String {
    match env::var("POSTGRES_USER") {
        Ok(host) => host,
        Err(_) => "api".to_string()
    }
}

pub fn get_postgres_password() -> String {
    match env::var("POSTGRES_PASSWORD") {
        Ok(password) => password,
        Err(_) => "dev".to_string()
    }
}

pub fn get_postgres_host() -> String {
    match env::var("POSTGRES_HOST") {
        Ok(host) => host,
        Err(_) => "postgres".to_string()
    }
}

pub fn get_postgres_port() -> u16 {
    match env::var("POSTGRES_PORT") {
        Ok(port) => match port.parse::<u16>() {
            Ok(v) => v,
            Err(_) => 5432
        }
        Err(_) => 5432
    }
}

pub fn get_postgres_db() -> String {
    match env::var("POSTGRES_DB") {
        Ok(db) => db,
        Err(_) => "api".to_string()
    }
}
