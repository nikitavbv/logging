import React, { useState, useEffect } from 'react';
import { api_request } from '../api/v2';

type QueryPageProps = {
    match: {
        params: {
            queryId: string,
        }
    },
};

export const QueryPage = (props: QueryPageProps) => {
    const [code, updateCode] = useState('loading...');

    useEffect(() => {
        loadQueryCode(props.match.params.queryId, updateCode);
    }, []);

    return (
        <div style={{
            display: 'flex',
            width: '100%',
        }}>
            <textarea value={code} style={{
                width: '90%',
                margin: '0',
                padding: '0',
            }} onChange={v => updateCode(v.currentTarget.value)} />
            <button style={{
                borderRadius: 0,
            }}>Run</button>
        </div>
    );
};

const loadQueryCode = (queryId: string, updateCode: (code: string) => void) => {
    api_request('init', 'GET').then(res => {
        for (const query of res.body.queries) {
            if (query[0] !== undefined && query[0].id === queryId) {
                updateCode(query[0].code);
                return;
            }
        }
    });
};