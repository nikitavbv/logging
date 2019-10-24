use serde::{Serialize};

use gethostname::gethostname;
use chrono::{DateTime, Utc};

pub struct Logger {
    logging_endpoint: String,
    logger_id: String,
    service_name: String,
    hostname: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct LogRequest {
    logger_id: String,
    entries: Vec<LogEntry>,
}

#[derive(Serialize)]
struct LogEntry {
    service_name: String,
    hostname: String,
    timestamp: String,
    tag: String,
    data: String,
}

#[derive(Serialize)]
pub struct LogMessage {
    pub message: String
}

impl Logger {
    pub fn new(logging_endpoint: &str, logger_id: &str, service_name: &str) -> Logger {
        Logger {
            logging_endpoint: logging_endpoint.to_string(),
            service_name: service_name.to_string(),
            logger_id: logger_id.to_string(),
            hostname: gethostname().into_string().unwrap(),
            client: reqwest::Client::new()
        }
    }

    pub fn send_request(&self, log_request: &LogRequest) {
        self.client.post(&self.logging_endpoint)
            .json(&log_request)
            .send();
    }

    pub fn log<T>(&self, tag: &str, data: T) where T: Serialize {
        let timestamp: DateTime<Utc> = Utc::now();

        let entry = LogEntry {
            service_name: self.service_name.clone(),
            hostname: self.hostname.clone(),
            timestamp: format!("{}", timestamp),
            tag: tag.to_string(),
            data: serde_json::to_string(&data).unwrap(),
        };

        let request = LogRequest {
            logger_id: self.logger_id.clone(),
            entries: vec![entry],
        };

        self.send_request(&request);
    }
}