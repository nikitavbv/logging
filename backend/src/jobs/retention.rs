use std::time::Duration;

use crate::database::database::Database;
use actix::{Context, Actor, AsyncContext, Message, Handler};
use actix_rt::Runtime;

const RUN_JOB_INTERVAL: u64 = 60 * 60; // every hour

pub struct RetentionJob {
    pub database: Database,
}

impl Actor for RetentionJob {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Context<Self>) {
        ctx.run_interval(Duration::from_secs(RUN_JOB_INTERVAL), |_, ctx| {
            ctx.address().do_send(RunJobMessage {});
        });
    }
}

struct RunJobMessage {
}

impl Message for RunJobMessage {
    type Result = ();
}

impl Handler<RunJobMessage> for RetentionJob {
    type Result = ();

    fn handle(&mut self, _msg: RunJobMessage, _ctx: &mut Self::Context) -> Self::Result {
        let mut rt = match Runtime::new() {
            Ok(v) => v,
            Err(err) => {
                eprintln!("failed to get runtime to run delete old logs job: {}", err);
                return;
            }
        };

        rt.block_on(delete_old_logs(self.database.clone()));
    }
}

async fn delete_old_logs(mut database: Database) {
    sqlx::query!("delete from log where delete_at < current_timestamp returning service_name")
        .fetch_one(&mut database)
        .await;
}