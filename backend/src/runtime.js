const ops = Deno.core.ops();

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    const buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}

function service(name) {
    Deno.core.print('p is ' + str2ab(name));

    const result = Deno.core.dispatch(ops['service'], str2ab(name), null);

    Deno.core.print('result is ' + result + '\n');
}

Deno.core.print('runtime loaded\n');

service('demo');