import React, { useState, useEffect } from 'react';

import { Logger } from '../../types';
import { Clickable } from '../../components/Clickable';
import { api_request } from '../../api/v2';

type LoggerEntryProps = {
    logger: Logger,
    onDeleted: () => void,
    updateName?: (name: string) => void,
};

export const LoggerEntry = (props: LoggerEntryProps) => {
    const [ isExpanded, updateIsExpanded ] = useState(false);
    const [ name, updateLoggerName ] = useState(props.logger.name);

    return (
        <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 0',
            userSelect: 'none',
        }}>
            <span style={{
                fontSize: '16pt',
                cursor: 'pointer',
            }} onClick={ () => updateIsExpanded(!isExpanded) }>{ name }</span>

            { isExpanded ? <ExpandedLoggerInfo logger={props.logger} onDeleted={props.onDeleted} updateName={updateLoggerName} /> : undefined }
        </div>
    );
};

export const ExpandedLoggerInfo = (props: LoggerEntryProps) => {
    const [ isEditingRetention, updateIsEditionRetention ] = useState(false);
    const [ retention, updateRetention ] = useState(props.logger.retention);
    
    const [ users, updateUsers ] = useState([] as any[]);
    const [ isAddingUser, updateIsAddingUser ] = useState(false);
    const [ newUserEmail, updateNewUserEmail ] = useState('');

    const [ isRenaming, updateIsRenaming ] = useState(false);
    const [ loggerName, updateLoggerName ] = useState(props.logger.name);

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

    const renameCtl = isRenaming ? (
        <span>
            <input value={ loggerName } onChange={ v => {
                updateLoggerName(v.currentTarget.value);
            }} />
            <button style={{ marginLeft: '10px' }} onClick={ () => {
                updateIsRenaming(false);
                if (props.updateName) {
                    props.updateName(loggerName);
                }
                updateLoggerNameAPICall(props.logger.id, loggerName);
            }}>Save</button>
        </span>
    ) : (
        <span>
            <Clickable onClick={updateIsRenaming.bind({}, true)}>
                rename
            </Clickable>
        </span>
    );
    
    return (
        <div>
            <div style={{
                marginTop: '10px',
            }}>
                retention: { retentionCtl }
            </div>

            <div style={{ marginTop: '10px' }}>
                { renameCtl }
            </div>

            <div style={{ marginTop: '10px' }} >
                <Clickable onClick={() => {
                    deleteLoggerAPICall(props.logger.id);
                    props.onDeleted();
                }}>delete</Clickable>
            </div>

            <div style={{ marginTop: '10px' }}>
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

const deleteLoggerAPICall = (logger_id: string) => {
    api_request(`logger/${logger_id}`, 'DELETE');
};

const updateLoggerNameAPICall = (logger_id: string, name: string) => {
    api_request(`logger/${logger_id}`, 'POST', { name });
};