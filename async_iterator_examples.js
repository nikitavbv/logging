const metasync = require('metasync');

const x = metasync.asyncIter([1, 2, 3, 4, 5])
    .map(x => x * 2)
//    .forEach(console.log);

const f = metasync([(x, y) => y(null, { arg: x.arg * 2 }), (x, y) => y(null, { arg: x.arg + 1 })]);
f({ arg: 42 }, console.log);

const asyncIterable = {
    [Symbol.asyncIterator]: async function* asyncGenerator() {
        const array = [0, 1, 2, 3, 4];
    
        while (array.length > 0) {
            yield await Promise.resolve(array.shift());
        }
    }
};
  
const asyncIterResult = metasync.asyncIter(asyncIterable)
    .map(x => x * 2)
    .reduce((a, b) => a + b);

asyncIterResult.then(console.log);