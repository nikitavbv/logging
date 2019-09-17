import { readFileSync } from 'fs';

export default Object.assign({
    port: 8080
}, JSON.parse(readFileSync('config.json', 'utf8')));