use deno_core::*;

use futures::future::{Future, Ready};
use futures::future::FutureExt;
use futures::task::{Context, Poll};
use futures::compat::Compat01As03;
use std::pin::Pin;
use std::ops::Deref;

use crate::database::database::{Database, connect};

pub fn evaluate_javascript() {
    let source = "Deno.core.print(1 + Math.pow(3, 2) + '\\n');";
    
    let startup_data = StartupData::Script(Script {
        source: include_str!("runtime.js"),
        filename: "runtime.js",
    });

    let mut isolate = deno_core::Isolate::new(startup_data, false);
    isolate.register_op("service", service_op);
    isolate.execute(&"demo.js", &source).unwrap();
}

fn service_op(control: &[u8], _zero_copy: Option<PinnedBuf>) -> CoreOp {
    /*let mut runtime = actix_rt::Runtime::new().unwrap();
    let mut database = runtime.block_on(connect()).unwrap();*/

    println!("service op is called");
    println!("control is {:?}", control);

    //let res = runtime.block_on(sqlx::query!("select * from log where service_name = $1", &[service_name]).fetch_one(&mut database.clone()));
    //println!("database res is {:?}", res);
    // Op::Sync(res.into_boxed_slice())

    Op::Sync(vec![42 as u8, 92 as u8, 21 as u8].into_boxed_slice())
}