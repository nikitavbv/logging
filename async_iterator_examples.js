const metasync = require('metasync');

const x = metasync.asyncIter([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .forEach(console.log);