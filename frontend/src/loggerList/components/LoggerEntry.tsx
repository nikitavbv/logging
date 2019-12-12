import React, { useState } from 'react';

import { Logger } from '../../types';
import { Clickable } from '../../components/Clickable';
import { api_request } from '../../api/v2';

type LoggerEntryProps = {
    logger: Logger,
};

export const LoggerEntry = (props: LoggerEntryProps) => {
    const [ isExpanded, updateIsExpanded ] = useState(false);

    return (
        <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 0',
            userSelect: 'none',
        }}>
            <span style={{
                fontSize: '16pt',
                cursor: 'pointer',
            }} onClick={ () => updateIsExpanded(!isExpanded) }>{ props.logger.name }</span>

            { isExpanded ? <ExpandedLoggerInfo logger={props.logger} /> : undefined }
        </div>
    );
};

export const ExpandedLoggerInfo = (props: LoggerEntryProps) => {
    const [ isEditingRetention, updateIsEditionRetention ] = useState(false);
    const [ retention, updateRetention ] = useState(props.logger.retention);

    const retentionCtl = isEditingRetention ? (
        <span>
            <input value={ retention } onChange={v => updateRetention(parseFloat(v.currentTarget.value))}/>
            <button style={{ marginLeft: '10px' }}  onClick={ () => {
                updateIsEditionRetention(false);
                updateRetentionAPICall(props.logger.id, retention);
            }}>Save</button>
        </span>
    ) : (
        <span>
            { retention } hours (<Clickable onClick={updateIsEditionRetention.bind({}, true)}>change</Clickable>)
        </span>
    );

    return (
        <div style={{
            marginTop: '10px',
        }}>
            retention: { retentionCtl }
        </div>
    )
};

const updateRetentionAPICall = (logger_id: string, retention: number) => {
    api_request(`logger/${logger_id}`, 'POST', { retention });
};