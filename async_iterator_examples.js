const metasync = require('metasync');

const x = metasync.asyncIter([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .forEach(console.log);

const f = metasync([(x, y) => y(null, { b: x.n*2 }), (x, y) => y(null, { a: x.b+1 })]);
f({ n: 42 }, console.log);