import { readFileSync } from 'fs';

export default Object.assign({
    port: 8080,
    static_dir: 'frontend/build',
    app_secret: 'some app secret',
    jwt_config: {
        expiresIn: '1d',
    }
}, JSON.parse(readFileSync('config.json', 'utf8')));