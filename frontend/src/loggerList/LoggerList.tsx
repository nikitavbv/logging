import React, { useState, useEffect } from 'react';
import { api_request } from '../api/v2';
import { Logger } from '../types';
import { NewLoggerCreator } from './components/NewLoggerCreator';
import { APIKeyDisplay } from './components/APIKeyDisplay';
import { LoggerEntry } from './components/LoggerEntry';

export const LoggerList = () => {
    const [ creatingNewLogger, updateCreatingNewLogger ] = useState(false);
    const [ loggers, updateLoggers ] = useState([] as Logger[]);
    const [ newLoggerAPIKey, updateNewLoggerAPIKey ] = useState('');

    useEffect(() => doInit(updateLoggers), []);
    
    return (
        <div style={{
            width: 'calc(50% - 80px)',
            marginLeft: '40px',
            marginRight: '40px',
            marginTop: '40px',
            backgroundColor: 'white',
            padding: '10px',
        }}>
            <div>
                <h1 style={{ display: 'inline-block' }}>Loggers</h1>
                { !creatingNewLogger ? (<button style={{ width: '40px', margin: '0 8px' }} onClick={() => updateCreatingNewLogger(true)} >+</button>) : undefined }
            </div>
            { creatingNewLogger ? <NewLoggerCreator onLoggerNameSelected={name => createLogger(name, loggers, updateLoggers, updateNewLoggerAPIKey, updateCreatingNewLogger)} /> : undefined }
            { newLoggerAPIKey ? <APIKeyDisplay apiKey={newLoggerAPIKey} onHide={() => updateNewLoggerAPIKey('')} /> : undefined }

            { loggers.map(logger => <LoggerEntry logger={logger} />) }
        </div>
    );
};

const createLogger = (name: string, loggers: Logger[], updateLoggers: (newLoggers: Logger[]) => void, updateNewLoggerAPIKey: (apiKey: string) => void, updateCreatingNewLogger: (creatingNewLogger: boolean) => void) => {
    api_request('logger', 'POST', { name }).then(res => {
        updateLoggers([ ...loggers, { name, id: res.body.logger_id, retention: 144 }]);
        updateNewLoggerAPIKey(res.body.api_key);
        updateCreatingNewLogger(false);
    });
};

const doInit = (updateLoggers: (loggers: Logger[]) => void) => {
    api_request('init', 'GET').then(res => {
        updateLoggers(res.body.loggers.map((r: any) => r[0]));
    });
};