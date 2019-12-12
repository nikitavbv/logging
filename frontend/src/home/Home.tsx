import React from 'react';

import { LoggerList } from '../loggerList';
import { QueryList } from '../queryList/QueryList';

export const Home = () => {
    return (
        <div style={{
            display: 'flex',
        }}>
            <LoggerList />
            <QueryList />
        </div>
    )
};