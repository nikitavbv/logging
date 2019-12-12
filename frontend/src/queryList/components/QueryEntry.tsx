import React, { useState } from 'react';
import { Query } from '../../types/query';

type QueryEntryProps = {
    query: Query,
    onDeleted: () => void,
    updateName?: (name: string) => void,
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
            }} onClick={ () => updateIsExpanded(!isExpanded)}>{ name }</span>
        
            { isExpanded ? <ExpandedQueryInfo query={props.query} onDeleted={props.onDeleted} updateName={updateQueryName} /> : undefined }
        </div>
    );
};

export const ExpandedQueryInfo = (props: QueryEntryProps) => {
    return (
        <div>
            query: { props.query.name }
        </div>
    )
};