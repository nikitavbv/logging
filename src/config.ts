import { readFileSync } from 'fs';

export default Object.assign({
    port: 8080,
    static_dir: 'frontend/build/static'
}, JSON.parse(readFileSync('config.json', 'utf8')));