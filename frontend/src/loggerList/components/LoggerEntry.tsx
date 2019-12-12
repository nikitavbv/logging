import React, { useState, useEffect } from 'react';

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
    
    const [ users, updateUsers ] = useState([] as any[]);
    const [ isAddingUser, updateIsAddingUser ] = useState(false);
    const [ newUserEmail, updateNewUserEmail ] = useState('');

    useEffect(() => {
        api_request(`logger/user/${props.logger.id}`, 'GET').then(res => {
            updateUsers(res.body.users);
        });
    }, []);

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

    const addingUserCtl = isAddingUser ? (
        <span>
            <input value={ newUserEmail } onChange={ v => updateNewUserEmail(v.currentTarget.value) } placeholder='email' />
            <button style={{ marginLeft: '10px' }} onClick={ () => {
                updateIsAddingUser(false);
                updateUsers([ ...users, { user: newUserEmail }]);
                addUserAPICall(props.logger.id, newUserEmail);
            } }>Save</button>
        </span>
    ) : (
        <span>
            <Clickable onClick={ () => updateIsAddingUser(true) }>add new</Clickable>
        </span>
    );
    
    return (
        <div>
            <div style={{
                marginTop: '10px',
            }}>
                retention: { retentionCtl }
            </div>

            <div>
                Users:
                { 
                    users.map(user => {
                        return (
                            <div>
                                { user.user } (<Clickable onClick={() => {
                                    updateUsers(users.filter(u => user.user !== u.user));
                                    removeUserAPICall(props.logger.id, user.user);
                                }}>remove</Clickable>)
                            </div>
                        )
                    })
                }
                { addingUserCtl }
            </div>
        </div>
        
    )
};

const updateRetentionAPICall = (logger_id: string, retention: number) => {
    api_request(`logger/${logger_id}`, 'POST', { retention });
};

const addUserAPICall = (logger_id: string, email: string) => {
    api_request('logger/user/add', 'POST', { logger_id, email });
};

const removeUserAPICall = (logger_id: string, email: string) => {
    api_request('logger/user/remove', 'POST', { logger_id, email });
};