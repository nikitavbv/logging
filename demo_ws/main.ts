import { client, IMessage, connection } from 'websocket';
import { readFileSync } from 'fs';

const ws = new client();

ws.on('connect', (connection) => {
    console.log('connected');
    
    connection.on('message', (_: IMessage) => {
        sendLogEntries(connection);
    });

    connection.send(JSON.stringify({
        action: 'auth',
        api_key: 'd4f2eb2c5a7d06a471c15e46afea1f2f8abb713abb7bd1a7'
    }));
});

/*const sendLogEntries = (connection: connection) => {
    connection.send(JSON.stringify({
        action: 'log',
        entries: [{
            service_name: 'demo_ws',
            hostname: 'some_hostname',
            timestamp: new Date().toISOString(),
            tag: 'info',
            data: { 'foo': 'bar' },
        }, {
            service_name: 'demo_ws',
            hostname: 'some_hostname',
            timestamp: new Date().toISOString(),
            tag: 'info',
            data: { 'hello': 'world' },
        }]
    }));
};*/

const sendLogEntries = (connection: connection) => {
    const f = readFileSync('weblog.csv').toString();
    const data = f.split('\n').map(line => line.split(',')).map(line => ({
        service_name: 'weblog',
        hostname: 'online_judge_server',
        timestamp: new Date().toISOString(),
        tag: 'info',
        data: {
            source: line[0],
            timestamp: line[1],
            httpEvent: line[2],
            responseCode: line[3]
        }
    }));

    for (let i = 0; i < data.length; i++) {
        setTimeout(() => {
            connection.send(JSON.stringify({
                action: 'log',
                entries: [ data[i] ]
            }))
        }, i * 400);
    }
};

ws.connect('ws://localhost:8080', 'logging');