import { client, IMessage, connection } from 'websocket';

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

const sendLogEntries = (connection: connection) => {
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
};

ws.connect('ws://localhost:8080', 'logging');