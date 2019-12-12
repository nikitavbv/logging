import React, { useState } from 'react';
import { Query } from '../../types/query';
import { Clickable } from '../../components/Clickable';
import { api_request } from '../../api/v2';

type QueryEntryProps = {
    query: Query,
    onDeleted: () => void,
    updateName?: (name: string) => void,
    isStarred: boolean,
    updateStarred?: (starred: boolean) => void,
};

export const QueryEntry = (props: QueryEntryProps) => {
    const [ isExpanded, updateIsExpanded ] = useState(false);
    const [ name, updateQueryName ] = useState(props.query.name);
    
    return (
        <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 0',
            userSelect: 'none',
        }}>
            <span style={{
                fontSize: '16pt',
                cursor: 'pointer'
            }} onClick={ () => updateIsExpanded(!isExpanded)}>
                { props.isStarred ? (<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">
                    <path d="M7.5 0.25 L9.375 6 h5.625 L10.375 9.25 L12.25 14.875 L7.5 11.375 L2.75 14.875 L4.625 9.25 L0 6 h5.625 Z" />
                </svg>) : undefined }
                { name }
            </span>
        
            { isExpanded ? <ExpandedQueryInfo query={props.query} onDeleted={props.onDeleted} updateName={updateQueryName} isStarred={props.isStarred} updateStarred={props.updateStarred} /> : undefined }
        </div>
    );
};

export const ExpandedQueryInfo = (props: QueryEntryProps) => {
    const [ isRenaming, updateIsRenaming ] = useState(false);

    const [ name, updateName ] = useState(props.query.name);

    const renameCtl = isRenaming ? (
        <span>
            <input value={ name } onChange={ v => {
                updateName(v.currentTarget.value)
            } } />
            <button style={{ marginLeft: '10px' }} onClick={ () => {
                updateIsRenaming(false);
                if (props.updateName) {
                    props.updateName(name);
                }
                updateQueryNameAPICall(props.query.id, name);
            } }>Save</button>
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
            <div style={{ marginTop: '10px' }}>
                { props.isStarred ? (
                    <Clickable onClick={() => {
                        unstarQueryAPICall(props.query.id);
                        if (props.updateStarred) {
                            props.updateStarred(false);
                        }
                    }}>unstar</Clickable>
                ) : (
                    <Clickable onClick={() => {
                        starQueryAPICall(props.query.id);
                        if (props.updateStarred) {
                            props.updateStarred(true);
                        }
                    }}>star</Clickable>
                ) }
            </div>
            <div style={{ marginTop: '10px' }}>
                { renameCtl }
            </div>
            <div style={{ marginTop: '10px' }}>
                <Clickable onClick={() => {
                    deleteQueryAPICall(props.query.id);
                    props.onDeleted();
                }}>delete</Clickable>
            </div>
        </div>
    )
};

const deleteQueryAPICall = (query_id: string) => {
    api_request('query/delete', 'POST', { query_id });
};

const starQueryAPICall = (query_id: string) => {
    api_request('query/star', 'POST', { query_id });
};

const unstarQueryAPICall = (query_id: string) => {
    api_request('query/unstar', 'POST', { query_id });
};

const updateQueryNameAPICall = (query_id: string, name: string) => {
    api_request('query/update', 'POST', { query_id, name });
};