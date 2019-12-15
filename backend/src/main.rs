#[macro_use] extern crate mozjs;

use mozjs::jsapi::CompartmentOptions;
use mozjs::jsapi::JS_NewGlobalObject;
use mozjs::jsapi::OnNewGlobalHookOption;
use mozjs::jsval::UndefinedValue;
use mozjs::rust::{JSEngine, Runtime, SIMPLE_GLOBAL_CLASS};

use std::ptr;

fn main() {
    println!("Hello, world!");
    evaluate_javascript();
}

fn evaluate_javascript() {
    // docs: https://doc.servo.org/mozjs/jsapi/union.Value.html
    // source code and tests: https://github.com/servo/rust-mozjs/tree/v0.10.1
    let engine = JSEngine::init().unwrap();
    let rt = Runtime::new(engine);
    let cx = rt.cx();

    // No way to avoid this unsafe...
    unsafe {
        rooted!(in(cx) let global =
            JS_NewGlobalObject(cx, &SIMPLE_GLOBAL_CLASS, ptr::null_mut(),
                               OnNewGlobalHookOption::FireOnNewGlobalHook,
                               &CompartmentOptions::default())
        );
        rooted!(in(cx) let mut rval = UndefinedValue());
        rt.evaluate_script(global.handle(), "1 + Math.pow(3, 2)",
                                   "test", 1, rval.handle_mut());
        println!("{}", rval.to_int32());
    }
}