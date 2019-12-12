import React from 'react';

import { Logger } from '../../types';

type LoggerEntryProps = {
    logger: Logger,
};

export const LoggerEntry = (props: LoggerEntryProps) => {
    return (
        <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 0'
        }}>
            <span style={{
                fontSize: '16pt',
            }}>{ props.logger.name }</span>
        </div>
    );
};