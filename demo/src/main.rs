#[macro_use] extern crate serde;
extern crate chrono;
extern crate rand;

mod logger;

use std::{thread, time};

use chrono::{DateTime, Utc};
use serde::{Serialize};
use rand::Rng;

use crate::logger::{Logger, LogMessage};

const LOGGER: &str = "7e8bae61-89ca-42f1-b347-597f0d8e5d9b";

#[derive(Serialize)]
struct Purchase {
    timestamp: String,
    deliver_to: String,
    items: Vec<Item>
}

#[derive(Serialize)]
struct Item {
    number: u32,
    price: u32,
}

fn main() {
    println!("demo started");

    let logger = Logger::new("http://localhost:8080/api/v1/log", LOGGER, "demo_service");

    logger.log("debug", &LogMessage {
        message: "demo started".to_string()
    });

    loop {
        simulate_purchase(&logger);
        thread::sleep(time::Duration::from_millis(10000));
    }
}

fn simulate_purchase(logger: &Logger) {
    let mut rng = rand::thread_rng();
    let total_items = rng.gen_range(1, 10);
    let deliver_to = random_city();

    let mut items = vec![];
    for i in (0..total_items) {
        items.push(Item {
            number: rng.gen_range(1, 5),
            price: rng.gen_range(10, 100)
        });
    }

    let purchase = Purchase {
        timestamp: format!("{}", Utc::now()),
        deliver_to,
        items
    };

    logger.log("info", purchase);
}

fn random_city() -> String {
    let mut rng = rand::thread_rng();
    let n = rng.gen_range(0, 100);

    if n < 20 {
        return "New York".to_string()
    }

    if n < 50 {
        return "London".to_string()
    }

    if n < 72 {
        return "Berlin".to_string()
    }

    if n < 96 {
        return "Chicago".to_string()
    }

    return "Kyiv".to_string()
}