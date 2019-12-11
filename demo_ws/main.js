"use strict";
exports.__esModule = true;
var websocket_1 = require("websocket");
var ws = new websocket_1.client();
ws.on('connect', function (connection) {
    console.log('connected');
    connection.on('message', function (_) {
        sendLogEntries(connection);
    });
    connection.send(JSON.stringify({
        action: 'auth',
        api_key: 'd4f2eb2c5a7d06a471c15e46afea1f2f8abb713abb7bd1a7'
    }));
});
var sendLogEntries = function (connection) {
    connection.send(JSON.stringify({
        action: 'log',
        entries: [{
                service_name: 'demo_ws',
                hostname: 'some_hostname',
                timestamp: new Date().toISOString(),
                tag: 'info',
                data: { 'foo': 'bar' }
            }, {
                service_name: 'demo_ws',
                hostname: 'some_hostname',
                timestamp: new Date().toISOString(),
                tag: 'info',
                data: { 'hello': 'world' }
            }]
    }));
};
ws.connect('ws://localhost:8080', 'logging');
