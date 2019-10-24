import { readFileSync } from 'fs';

export default Object.assign({
    port: 8080,
    static_dir: 'frontend/build',
    app_secret: 'some app secret',
    jwt_config: {
        expiresIn: '1d',
    },
    database_connection_string: 'postgres://logging_dev_user:logging_dev_password@localhost:5432/postgres'
}, JSON.parse(readFileSync('config.json', 'utf8')));