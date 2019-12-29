use deno::*;

pub fn evaluate_javascript() {
    let source = "Deno.core.print(1 + Math.pow(3, 2) + '\\n');Deno.core.demo();";
    
    let startup_data = StartupData::Script(Script {
        source: include_str!("runtime.js"),
        filename: "runtime.js",
    });

    let mut isolate = deno::Isolate::new(startup_data, false);
    isolate.register_op("demo", demo_op);
    isolate.execute(&"demo.js", &source).unwrap();
}

fn demo_op(control: &[u8], zero_copy_buf: Option<PinnedBuf>) -> CoreOp {
    println!("demo op is called");

    let promise_id = 0;
    let arg = 1;
    let result = 2;

    let buf32 = vec![promise_id, arg, result].into_boxed_slice();
    let ptr = Box::into_raw(buf32) as *mut [u8; 3 * 4];
    let res = unsafe { Box::from_raw(ptr) };

    Op::Sync(res)
}