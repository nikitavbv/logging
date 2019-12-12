import React, { useState, useEffect } from 'react';
import { api_request } from '../api/v2';
import { NewQueryCreator } from './components/NewQueryCreator';
import { Query } from '../types/query';
import { QueryEntry } from './components/QueryEntry';

export const QueryList = () => {
    const [ creatingNewQuery, updateCreatingNewQuery ] = useState(false);
    const [ queries, updateQueries ] = useState([] as Query[]);
    
    useEffect(() => doInit(updateQueries), []);

    return (
        <div style={{
            width: 'calc(50% - 40px)',
            marginLeft: '0px',
            marginRight: '40px',
            marginTop: '40px',
            backgroundColor: 'white',
            padding: '10px'
        }}>
            <div>
                <h1 style={{ display: 'inline-block' }}>Queries</h1>
                { !creatingNewQuery ? (<button style={{ width: '40px', margin: '0 8px' }} onClick={updateCreatingNewQuery.bind({}, true)}>+</button>) : undefined }
            </div>
            { creatingNewQuery ? <NewQueryCreator onQueryNameSelected={name => {
                createNewQuery(name, queries, updateQueries);
                updateCreatingNewQuery(false);
            } } /> : undefined }
            
            { queries.map(query => <QueryEntry query={query} onDeleted={() => {
                updateQueries(queries.filter(entry => entry.id !== query.id))
            }} />) }
        </div>
    );
};

const doInit = (updateQueries: (queries: Query[]) => void) => {
    api_request('init', 'GET').then(res => {
        updateQueries(res.body.queries.map((r: any) => r[0]).filter((r: any) => r !== undefined));
    });
};

const createNewQuery = (name: string, queries: Query[], updateQueries: (queries: Query[]) => void) => {
    const code = '// hello world';

    api_request('query', 'POST', { name, code }).then(res => {
        updateQueries([ ...queries, { name, code, id: res.body.query_id as string } as Query]);
    });
};