import React, { useState, useEffect } from 'react';
import { api_request } from '../api/v2';

type QueryPageProps = {
    match: {
        params: {
            queryId: string,
        }
    },
};

let result: any[] = [];

export const QueryPage = (props: QueryPageProps) => {
    const [code, updateCode] = useState('loading...');
    const [ ws, setWS ] = useState(undefined as any); 
    const [ resultForRendering, updateResultForRendering ] = useState();

    useEffect(() => {
        loadQueryCode(props.match.params.queryId, updateCode);
    }, []);

    console.log(JSON.stringify((resultForRendering || [])));

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080', 'logging');
        socket.onopen = () => {
            console.log('connected');
        };

        socket.onmessage = (msg: any) => {
            const parsed = JSON.parse(msg.data);
            if (parsed.action === 'result.single') {
                result = parsed.item;
            } else {
                if (result === undefined || result.push === undefined) {
                    result = [];
                }
                result = [ parsed.item, ...result ];
            }
            updateResultForRendering(result);
        };

        setWS(socket);
    }, []);

    return (
        <div>
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
                }} onClick={
                    () => {
                        updateResultForRendering([]);
                        runQuery(props.match.params.queryId, code, ws);
                    }
                }>Run</button>
            </div>
            { render_query_result(resultForRendering) }
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

const runQuery = (query_id: string, code: string, ws: WebSocket) => {
    api_request('query/update', 'POST', { query_id, code });

    if (ws !== undefined) {
        result = [];
        ws.send(JSON.stringify({
            action: 'query',
            code
        }));
    }
};

function render_query_result(result: unknown) {
    if (Array.isArray(result)) {
        return render_query_result_table(result);
    }

    return (<div>Result: {JSON.stringify(result)}</div>)
}


function render_query_result_table(result: any[]) {
    const columns = new Set<string>();
    result.forEach((row: any) => {
        if (typeof row === 'string') {
            return 'value';
        }
        return Object.keys(row).forEach(key => columns.add(key));
    });
    const columns_arr = (result.length > 0 && columns.size === 0) ? ['value'] : Array.from(columns);

    if (result.length > 100) {
        result = result.slice(0, 100);
    }

    return (
        <table>
            <tr>
                {render_query_result_table_header(columns_arr)}
            </tr>
            { render_query_result_table_rows(columns_arr, result) }
        </table>
    )
}

function render_query_result_table_header(columns: string[]) {
    return columns.map(column => (<th>{column}</th>));
}

function render_query_result_table_rows(columns: string[], data: any[]) {
    return data.map(row => (<tr>{render_query_result_table_row(columns, row)}</tr>));
}

function render_query_result_table_row(columns: string[], data: any) {
    if (typeof data !== 'object') {
        return (<td>{data}</td>)
    }

    return columns.map(column => (<td>{render_query_result_table_row_cell(data[column])}</td>));
}

function render_query_result_table_row_cell(cell: any) {
    if (typeof cell === 'object') {
        return JSON.stringify(cell);
    }

    if (cell === undefined) {
        return 'undefined';
    }

    return cell.toString();
}